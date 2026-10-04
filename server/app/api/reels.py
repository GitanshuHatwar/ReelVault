from fastapi import APIRouter, Depends, Query, Response

from app.db import repo
from app.deps import AuthUser, current_user
from app.errors import NotFound
from app.schemas.reels import ReelIn, ReelOut
from app.services.shallow_cook import save_reel
from app.services.titles import reel_title

router = APIRouter(prefix="/reels", tags=["reels"])


def _out(reel: dict, cached: bool = False) -> ReelOut:
    post = reel["source_posts"]
    return ReelOut(
        reel_id=reel["id"],
        platform=post["platform"],
        url=post["url"],
        title=reel_title(post),
        author=post.get("author"),
        transcript=post.get("transcript"),
        caption=post.get("caption"),
        created_at=reel["created_at"],
        cached=cached,
    )


@router.post("", response_model=ReelOut)
def create_reel(body: ReelIn, user: AuthUser = Depends(current_user)):
    return save_reel(body.url, user.id)


@router.get("", response_model=list[ReelOut])
def list_reels(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: AuthUser = Depends(current_user),
):
    return [_out(row, cached=True) for row in repo.list_user_reels(user.id, limit, offset)]


@router.get("/{reel_id}", response_model=ReelOut)
def get_reel(reel_id: int, user: AuthUser = Depends(current_user)):
    reel = repo.get_user_reel(user.id, reel_id)
    if reel is None:
        raise NotFound("reel not found")
    return _out(reel, cached=True)


@router.delete("/{reel_id}", status_code=204)
def delete_reel(reel_id: int, user: AuthUser = Depends(current_user)):
    if not repo.delete_user_reel(user.id, reel_id):
        raise NotFound("reel not found")
    return Response(status_code=204)
