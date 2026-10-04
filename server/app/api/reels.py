from fastapi import APIRouter, BackgroundTasks, Depends, Query, Response

from app.config import get_settings
from app.db import repo
from app.deps import AuthUser, current_user
from app.errors import NoContent, NotFound, RateLimited
from app.schemas.reels import DeepCookOut, ReelDetail, ReelIn, ReelListItem, ShallowCookOut
from app.services.deep_cook.pipeline import run_deep_cook
from app.services.shallow_cook import shallow_cook

router = APIRouter(prefix="/reels", tags=["reels"])


@router.post("", response_model=ShallowCookOut)
def create_reel(body: ReelIn, user: AuthUser = Depends(current_user)):
    return shallow_cook(body.url, user.id)


@router.get("", response_model=list[ReelListItem])
def list_reels(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: AuthUser = Depends(current_user),
):
    rows = repo.list_user_reels(user.id, limit, offset)
    statuses = repo.latest_deep_cook_statuses(user.id, [r["id"] for r in rows])
    return [
        ReelListItem(
            reel_id=r["id"],
            platform=r["source_posts"]["platform"],
            url=r["source_posts"]["url"],
            transcript_preview=((r["source_posts"]["transcript"] or r["source_posts"]["caption"] or "")[:200] or None),
            created_at=r["created_at"],
            deep_cook_status=statuses.get(r["id"]),
        )
        for r in rows
    ]


def _owned(user: AuthUser, reel_id: int) -> dict:
    reel = repo.get_user_reel(user.id, reel_id)
    if reel is None:
        raise NotFound("reel not found")
    return reel


@router.get("/{reel_id}", response_model=ReelDetail)
def get_reel(reel_id: int, user: AuthUser = Depends(current_user)):
    reel = _owned(user, reel_id)
    sp = reel["source_posts"]
    dc = repo.latest_deep_cook(user.id, reel_id)
    return ReelDetail(
        reel_id=reel["id"],
        platform=sp["platform"],
        url=sp["url"],
        transcript=sp["transcript"],
        caption=sp["caption"],
        language=sp["language_hint"],
        cached=True,
        created_at=reel["created_at"],
        deep_cook=DeepCookOut(**dc) if dc else None,
    )


@router.delete("/{reel_id}", status_code=204)
def delete_reel(reel_id: int, user: AuthUser = Depends(current_user)):
    if not repo.delete_user_reel(user.id, reel_id):
        raise NotFound("reel not found")
    return Response(status_code=204)


@router.post("/{reel_id}/deep-cook", response_model=DeepCookOut, status_code=202)
def start_deep_cook(reel_id: int, bg: BackgroundTasks, user: AuthUser = Depends(current_user)):
    reel = _owned(user, reel_id)
    sp = reel["source_posts"]
    if not (sp["transcript"] or sp["caption"]):
        raise NoContent("This reel has no text to analyze.")
    latest = repo.latest_deep_cook(user.id, reel_id)
    if latest and latest["status"] in repo.ACTIVE:
        return DeepCookOut(**latest)
    if repo.count_user_deep_cooks_since_24h(user.id) >= get_settings().deep_per_day:
        raise RateLimited("Daily deep-cook limit reached.")
    dc = repo.create_deep_cook(user.id, reel_id)
    bg.add_task(run_deep_cook, dc["id"])
    return DeepCookOut(**dc)


@router.get("/{reel_id}/deep-cook", response_model=DeepCookOut)
def get_deep_cook(reel_id: int, user: AuthUser = Depends(current_user)):
    _owned(user, reel_id)
    dc = repo.latest_deep_cook(user.id, reel_id)
    if dc is None:
        raise NotFound("no deep cook for this reel yet")
    return DeepCookOut(**dc)
