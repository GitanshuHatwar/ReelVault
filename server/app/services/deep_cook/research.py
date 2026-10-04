from langchain_core.messages import HumanMessage

from app.config import get_settings
from app.llm import get_llm
from app.schemas.domain import Extracted, ResearchReport, VerificationResult
from app.services.deep_cook import prompts as P
from app.services.deep_cook.tool_loop import gather_evidence
from app.services.tools.toolkit import ToolRun, build_tools

SECTIONS = ("eligibility", "timeline", "how_to_apply", "past_editions", "selection_criteria", "red_flags")


def research(
    ex: Extracted, ver: VerificationResult, run: ToolRun, *, tools_factory=build_tools
) -> ResearchReport:
    s = get_settings()
    llm = get_llm("main")
    brief = {
        "title": ex.title.value,
        "organizer": ex.organizer.value,
        "verdict": ver.verdict.value,
        "official_deadline": str(ver.official_deadline or ex.deadline.value),
        "known_official_urls": ver.official_urls,
    }
    messages, _ = gather_evidence(
        llm,
        tools_factory(run),
        P.RESEARCH_SYSTEM,
        "Research this opportunity:\n" + P.wrap("opportunity", str(brief)),
        max_calls=s.research_max_tool_calls,
        timeout_s=s.research_timeout_s,
    )
    report = llm.with_structured_output(ResearchReport).invoke(
        messages + [HumanMessage("Write the final briefing. Cite only URLs you read above.")]
    )
    return _guard(report, run)


def _guard(rep: ResearchReport, run: ToolRun) -> ResearchReport:
    for name in SECTIONS:
        kept = []
        for c in getattr(rep, name):
            c.source_urls = [u for u in c.source_urls if u in run.pages]
            if c.source_urls:
                kept.append(c)
        setattr(rep, name, kept)
    rep.related_links = [u for u in rep.related_links if u in run.seen_urls]
    return rep
