import logging

from app.db import repo
from app.errors import PipelineError
from app.schemas.domain import FetchedPost, Verdict, VerificationResult
from app.services.deep_cook.classify import classify
from app.services.deep_cook.extract import extract
from app.services.deep_cook.ground import ground
from app.services.deep_cook.research import research
from app.services.deep_cook.verify import verify
from app.services.tools.toolkit import ToolRun

log = logging.getLogger("deep_cook")
RESEARCH_VERDICTS = {Verdict.OFFICIAL_CONFIRMED, Verdict.FOUND_UNOFFICIAL, Verdict.CONFLICTING, Verdict.SUSPICIOUS}


def _set(dc_id: int, status: str, **fields) -> None:
    repo.update_deep_cook(dc_id, status=status, **fields)
    log.info("deep_cook=%s status=%s", dc_id, status)


def _source_post(reel: dict) -> dict:
    post = reel.get("source_posts") or {}
    if isinstance(post, list):
        post = post[0] if post else {}
    return post if isinstance(post, dict) else {}


def run_deep_cook(
    deep_cook_id: int,
    transcript: str | None = None,
    caption: str | None = None,
    title: str | None = None,
) -> None:
    """Background entrypoint. Never raises. Idempotent: only runs a 'queued' job."""
    dc = repo.get_deep_cook(deep_cook_id)
    if dc is None or dc["status"] != "queued":
        return
    try:
        reel = repo.get_user_reel(dc["user_id"], dc["user_reel_id"])
        if reel is None:
            raise PipelineError("reel_missing")
        sp = _source_post(reel)
        if not sp:
            raise PipelineError("reel_missing")
        post = FetchedPost(
            platform=sp["platform"],
            shortcode=sp["shortcode"],
            url=sp.get("url"),
            transcript=(transcript or sp.get("transcript") or "").strip() or None,
            caption=(caption or sp.get("caption") or "").strip() or None,
            posted_at=sp.get("posted_at") or None,
            raw={"saved_title": title} if title else {},
        )
        if not (post.transcript or post.caption):
            raise PipelineError("empty_content")

        _set(deep_cook_id, "classifying")
        cls = classify(post)
        repo.update_deep_cook(deep_cook_id, classification=cls.model_dump(mode="json"))
        if not cls.is_opportunity:
            return _set(deep_cook_id, "not_opportunity")

        _set(deep_cook_id, "extracting")
        ex, dropped = ground(extract(post), post)
        log.info("deep_cook=%s ungrounded_fields_dropped=%s", deep_cook_id, dropped)
        repo.update_deep_cook(deep_cook_id, extracted=ex.model_dump(mode="json"))

        if not (ex.title.value or ex.organizer.value):
            skipped = VerificationResult(
                verdict=Verdict.NOT_FOUND,
                summary="Not enough details to search for.",
                official_urls=[],
                supporting_urls=[],
                field_status={},
                official_deadline=None,
                scam_signals=[],
                guard_notes=["skipped: no title or organizer"],
            )
            return _set(deep_cook_id, "done", verification=skipped.model_dump(mode="json"), tool_calls=0)

        _set(deep_cook_id, "verifying")
        run = ToolRun(organizer=ex.organizer.value or "")
        ver, stats = verify(ex, run)
        repo.update_deep_cook(deep_cook_id, verification=ver.model_dump(mode="json"), tool_calls=stats.calls)

        if ver.verdict in RESEARCH_VERDICTS:
            _set(deep_cook_id, "researching")
            rep = research(ex, ver, run)
            repo.update_deep_cook(deep_cook_id, report=rep.model_dump(mode="json"))
        _set(deep_cook_id, "done")
    except PipelineError as e:
        _set(deep_cook_id, "failed", error_code=e.code)
    except Exception:
        log.exception("deep_cook=%s unexpected failure", deep_cook_id)
        _set(deep_cook_id, "failed", error_code="internal_error")
