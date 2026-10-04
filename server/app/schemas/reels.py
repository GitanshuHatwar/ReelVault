from datetime import datetime

from pydantic import BaseModel, Field


class ReelIn(BaseModel):
    url: str = Field(min_length=10, max_length=2048)


class ReelOut(BaseModel):
    reel_id: int
    platform: str
    url: str
    title: str
    author: str | None = None
    transcript: str | None = None
    caption: str | None = None
    created_at: datetime
    cached: bool = False
