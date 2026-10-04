from datetime import datetime, timedelta, timezone

from app.config import get_settings
from app.db.client import get_db
from app.errors import UpstreamFailed
from app.schemas.domain import FetchedPost, PostRef

FINAL = ("done", "not_opportunity", "failed")
ACTIVE = ("queued", "classifying", "extracting", "verifying", "researching")


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


def list_user_reels(user_id: str, limit: int = 20, offset: int = 0) -> list[dict]:
    res = (
        get_db()
        .table("user_reels")
        .select("id, created_at, source_posts(platform, url, transcript, caption, language_hint)")
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


def create_deep_cook(user_id: str, user_reel_id: int) -> dict:
    return (
        get_db()
        .table("deep_cooks")
        .insert({"user_id": user_id, "user_reel_id": user_reel_id, "status": "queued"})
        .execute()
        .data[0]
    )


def get_deep_cook(deep_cook_id: int) -> dict | None:
    return _one(get_db().table("deep_cooks").select("*").eq("id", deep_cook_id).limit(1).execute())


def latest_deep_cook(user_id: str, user_reel_id: int) -> dict | None:
    return _one(
        get_db()
        .table("deep_cooks")
        .select("*")
        .eq("user_id", user_id)
        .eq("user_reel_id", user_reel_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )


def latest_deep_cook_statuses(user_id: str, reel_ids: list[int]) -> dict[int, str]:
    if not reel_ids:
        return {}
    rows = (
        get_db()
        .table("deep_cooks")
        .select("user_reel_id, status, created_at")
        .eq("user_id", user_id)
        .in_("user_reel_id", reel_ids)
        .order("created_at", desc=True)
        .execute()
        .data
    )
    out: dict[int, str] = {}
    for r in rows:
        out.setdefault(r["user_reel_id"], r["status"])
    return out


def count_user_deep_cooks_since_24h(user_id: str) -> int:
    r = (
        get_db()
        .table("deep_cooks")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("created_at", _since(24))
        .execute()
    )
    return r.count or 0


def update_deep_cook(deep_cook_id: int, **fields) -> None:
    if fields.get("status") in FINAL:
        fields["finished_at"] = datetime.now(timezone.utc).isoformat()
    get_db().table("deep_cooks").update(fields).eq("id", deep_cook_id).execute()


def fail_stale_deep_cooks() -> None:
    """Background tasks die with the process. On startup, fail jobs that were left mid-flight."""
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=get_settings().stale_job_minutes)).isoformat()
    get_db().table("deep_cooks").update(
        {
            "status": "failed",
            "error_code": "interrupted",
            "finished_at": datetime.now(timezone.utc).isoformat(),
        }
    ).in_("status", list(ACTIVE)).lt("created_at", cutoff).execute()
