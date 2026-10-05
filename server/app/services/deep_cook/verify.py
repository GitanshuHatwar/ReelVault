from langchain_core.messages import HumanMessage

from app.config import get_settings
from app.errors import PipelineError
from app.llm import get_llm
from app.schemas.domain import Extracted, Verdict, VerdictDraft, VerificationResult
from app.services.deep_cook import prompts as P
from app.services.deep_cook.ground import contains
from app.services.deep_cook.tool_loop import LoopStats, gather_evidence
from app.services.tools.toolkit import ToolRun, build_tools


def verify(ex: Extracted, run: ToolRun, *, tools_factory=build_tools) -> tuple[VerificationResult, LoopStats]:
    s = get_settings()
    llm = get_llm("main")
    messages, stats = gather_evidence(
        llm,
        tools_factory(run),
        P.GATHER_SYSTEM,
        "Verify this claimed opportunity:\n" + P.wrap("claim", ex.model_dump_json(exclude_none=True, indent=2)),
        max_calls=s.verify_max_tool_calls,
        timeout_s=s.verify_timeout_s,
    )
    if stats.calls > 0 and stats.ok == 0:
        raise PipelineError("search_unavailable")
    draft = llm.with_structured_output(VerdictDraft).invoke(messages + [HumanMessage(P.JUDGE_PROMPT)])
    return apply_guard(draft, run, ex), stats


def apply_guard(draft: VerdictDraft, run: ToolRun, ex: Extracted) -> VerificationResult:
    """Deterministic. The LLM proposes; code disposes. When unsure, DOWNGRADE."""
    notes: list[str] = []
    verdict = draft.verdict
    official = [u for u in dict.fromkeys(draft.official_urls) if u in run.pages]
    support = [u for u in dict.fromkeys(draft.supporting_urls) if u in run.seen_urls]
    if len(official) < len(set(draft.official_urls)):
        notes.append("dropped official_urls that were not read in this run")

    def page_has_identity(u: str) -> bool:
        return any(contains(run.pages[u], v) for v in (ex.title.value, ex.organizer.value) if v)

    if verdict == Verdict.OFFICIAL_CONFIRMED:
        ok = [u for u in official if run.domain_checks.get(u, {}).get("plausibly_official") and page_has_identity(u)]
        if not ok:
            verdict = Verdict.FOUND_UNOFFICIAL if (official or support) else Verdict.NOT_FOUND
            notes.append("downgraded: no plausibly-official page (read) containing title/organizer")
        official = ok

    official_deadline = None
    if (
        official
        and draft.official_deadline
        and draft.official_deadline_quote
        and any(contains(run.pages[u], draft.official_deadline_quote) for u in official)
    ):
        official_deadline = draft.official_deadline
        if verdict == Verdict.OFFICIAL_CONFIRMED and ex.deadline.value and ex.deadline.value != official_deadline:
            verdict = Verdict.CONFLICTING
            notes.append("deadline differs from the official source; official date preferred")

    field_status: dict[str, str] = {}
    for fc in draft.field_checks:
        grounded = bool(fc.official_value) and any(contains(run.pages[u], fc.official_value) for u in official)
        field_status[fc.field] = fc.status if (fc.status != "matched" or grounded) else "unverified"

    if verdict == Verdict.SUSPICIOUS and not draft.scam_signals:
        verdict = Verdict.NOT_FOUND
        notes.append("suspicious without concrete signals -> not_found")

    return VerificationResult(
        verdict=verdict,
        summary=draft.summary,
        official_urls=official,
        supporting_urls=support,
        field_status=field_status,
        official_deadline=official_deadline,
        scam_signals=draft.scam_signals,
        guard_notes=notes,
    )
