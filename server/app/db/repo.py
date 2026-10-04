from datetime import datetime, timedelta, timezone

from app.db.client import get_db
from app.errors import UpstreamFailed
from app.schemas.domain import FetchedPost, PostRef


def _one(res) -> dict | None:
    return res.data[0] if res.data else None


def _since(hours: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


def get_source_post(platform: str, shortcode: str) -> dict | None:
    return _one(
        get_db()
        .table("source_posts")
        .select("*")
        .eq("platform", platform)
        .eq("shortcode", shortcode)
        .limit(1)
        .execute()
    )


def insert_source_post(f: FetchedPost, ref: PostRef) -> dict:
    row = {
        "platform": ref.platform,
        "shortcode": ref.shortcode,
        "url": ref.canonical_url,
        "author": f.author,
        "transcript": f.transcript,
        "caption": f.caption,
        "posted_at": f.posted_at.isoformat() if f.posted_at else None,
        "language_hint": f.language_hint,
        "raw": f.raw,
    }
    get_db().table("source_posts").upsert(row, on_conflict="platform,shortcode", ignore_duplicates=True).execute()
    post = get_source_post(ref.platform, ref.shortcode)
    if post is None:
        raise UpstreamFailed("could not store reel")
    return post


def link_user_reel(user_id: str, source_post_id: int) -> dict:
    get_db().table("user_reels").upsert(
        {"user_id": user_id, "source_post_id": source_post_id},
        on_conflict="user_id,source_post_id",
        ignore_duplicates=True,
    ).execute()
    linked = _one(
        get_db()
        .table("user_reels")
        .select("*")
        .eq("user_id", user_id)
        .eq("source_post_id", source_post_id)
        .limit(1)
        .execute()
    )
    if linked is None:
        raise UpstreamFailed("could not link reel to user")
    return linked


def count_user_reels_since_24h(user_id: str) -> int:
    r = (
        get_db()
        .table("user_reels")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("created_at", _since(24))
        .execute()
    )
    return r.count or 0


_POST_FIELDS = "platform, url, transcript, caption, author, raw"


def list_user_reels(user_id: str, limit: int = 20, offset: int = 0) -> list[dict]:
    res = (
        get_db()
        .table("user_reels")
        .select(f"id, created_at, source_posts({_POST_FIELDS})")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data


def get_user_reel(user_id: str, reel_id: int) -> dict | None:
    return _one(
        get_db()
        .table("user_reels")
        .select("id, created_at, source_post_id, source_posts(*)")
        .eq("id", reel_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )


def delete_user_reel(user_id: str, reel_id: int) -> bool:
    res = get_db().table("user_reels").delete().eq("id", reel_id).eq("user_id", user_id).execute()
    return bool(res.data)
