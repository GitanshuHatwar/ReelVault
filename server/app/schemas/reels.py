from datetime import datetime
from typing import Any, Literal

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


class DeepCookIn(BaseModel):
    transcript: str | None = None
    caption: str | None = None
    title: str | None = None


class DeepCookOut(BaseModel):
    id: int
    status: Literal["queued", "classifying", "extracting", "verifying", "researching", "done", "not_opportunity", "failed"]
    error_code: str | None = None
    classification: dict[str, Any] | None = None
    extracted: dict[str, Any] | None = None
    verification: dict[str, Any] | None = None
    report: dict[str, Any] | None = None
    tool_calls: int | None = None
    created_at: datetime
    finished_at: datetime | None = None
