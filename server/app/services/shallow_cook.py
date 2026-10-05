from app.config import get_settings
from app.db import repo
from app.errors import RateLimited
from app.schemas.reels import ReelOut
from app.services.ingestion.fetchers import get_fetcher
from app.services.ingestion.url_normalizer import normalize_url
from app.services.reel_analysis import analyze_reel
from app.services.titles import reel_title


def _analysis_failure(post: dict) -> dict | None:
    raw = post.get("raw") if isinstance(post.get("raw"), dict) else {}
    error = raw.get("reel_analysis_error")
    return error if isinstance(error, dict) else None


def _reel_out(reel: dict, post: dict, *, cached: bool) -> ReelOut:
    failure = _analysis_failure(post) or {}
    return ReelOut(
        reel_id=reel["id"],
        platform=post["platform"],
        url=post["url"],
        title=reel_title(post),
        author=post.get("author"),
        transcript=post.get("transcript"),
        caption=post.get("caption"),
        transcript_status="verified" if post.get("transcript") else "ambiguous" if post.get("caption") else "unavailable",
        analysis=(post.get("raw") or {}).get("reel_analysis"),
        analysis_error_code=failure.get("code"),
        analysis_error=failure.get("message"),
        created_at=reel["created_at"],
        cached=cached,
    )


def save_reel(raw_url: str, user_id: str) -> ReelOut:
    ref = normalize_url(raw_url)
    post = repo.get_source_post(ref.platform, ref.shortcode)
    cached = post is not None

    if cached:
        raw = post.get("raw") if isinstance(post.get("raw"), dict) else {}
        saved_analysis = raw.get("reel_analysis") if isinstance(raw.get("reel_analysis"), dict) else {}
        # A new save request is an explicit retry. It gets one provider call;
        # list refreshes and browser polling never invoke this path.
        if post.get("transcript") and (
            not saved_analysis
            or not saved_analysis.get("english_transcript")
            or "summary_points" not in saved_analysis
            or "tags" not in saved_analysis
        ):
            analysis, analysis_error = analyze_reel(post.get("transcript"), post.get("caption"))
            if analysis:
                post = repo.update_source_post_analysis(post["id"], analysis)
            elif analysis_error:
                post = repo.update_source_post_analysis(post["id"], error=analysis_error)
    else:
        if repo.count_user_reels_since_24h(user_id) >= get_settings().shallow_per_day:
            raise RateLimited("Daily limit for new reels reached.")
        fetched = get_fetcher(ref.platform).fetch(ref)
        # Keep a record of public reels even when the provider cannot extract
        # speech. The client marks these with a clear red cross instead of
        # pretending that the reel was successfully transcribed.
        # Save first. A Gemini outage must not cost the user their extracted
        # transcript or make saving wait for a provider retry loop.
        post = repo.insert_source_post(fetched, ref)
        analysis, analysis_error = analyze_reel(fetched.transcript, fetched.caption)
        if analysis:
            post = repo.update_source_post_analysis(post["id"], analysis)
        elif analysis_error:
            post = repo.update_source_post_analysis(post["id"], error=analysis_error)

    reel = repo.link_user_reel(user_id, post["id"])
    return _reel_out(reel, post, cached=cached)
