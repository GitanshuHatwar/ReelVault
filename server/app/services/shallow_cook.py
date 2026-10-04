from app.config import get_settings
from app.db import repo
from app.errors import NoContent, RateLimited
from app.schemas.reels import ShallowCookOut
from app.services.ingestion.fetchers import get_fetcher
from app.services.ingestion.url_normalizer import normalize_url


def shallow_cook(raw_url: str, user_id: str) -> ShallowCookOut:
    ref = normalize_url(raw_url)
    post = repo.get_source_post(ref.platform, ref.shortcode)
    cached = post is not None

    if not cached:
        if repo.count_user_reels_since_24h(user_id) >= get_settings().shallow_per_day:
            raise RateLimited("Daily limit for new reels reached.")
        fetched = get_fetcher(ref.platform).fetch(ref)
        if not (fetched.transcript or fetched.caption):
            raise NoContent("No transcript or caption could be extracted from this reel.")
        post = repo.insert_source_post(fetched, ref)

    reel = repo.link_user_reel(user_id, post["id"])
    return ShallowCookOut(
        reel_id=reel["id"],
        platform=post["platform"],
        url=post["url"],
        transcript=post["transcript"],
        caption=post["caption"],
        language=post["language_hint"],
        cached=cached,
        created_at=reel["created_at"],
    )
