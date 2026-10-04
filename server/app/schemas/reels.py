from datetime import datetime

from pydantic import BaseModel, Field


class ReelIn(BaseModel):
    url: str = Field(min_length=10, max_length=2048)


class ShallowCookOut(BaseModel):
    reel_id: int
    platform: str
    url: str
    transcript: str | None
    caption: str | None
    language: str | None
    cached: bool
    created_at: datetime


class DeepCookOut(BaseModel):
    id: int
    status: str
    error_code: str | None = None
    classification: dict | None = None
    extracted: dict | None = None
    verification: dict | None = None
    report: dict | None = None
    created_at: datetime
    finished_at: datetime | None = None


class ReelListItem(BaseModel):
    reel_id: int
    platform: str
    url: str
    transcript_preview: str | None
    created_at: datetime
    deep_cook_status: str | None = None


class ReelDetail(ShallowCookOut):
    deep_cook: DeepCookOut | None = None
