from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class ReelIn(BaseModel):
    url: str = Field(min_length=10, max_length=2048)


class MentionedSource(BaseModel):
    name: str
    url: str | None = None

    @model_validator(mode="before")
    @classmethod
    def accept_plain_source_names(cls, value: Any) -> Any:
        """Gemini occasionally returns a source as a bare name despite the schema."""
        if isinstance(value, str):
            return {"name": value}
        return value


class ReelDetails(BaseModel):
    dates: list[str] = Field(default_factory=list)
    books: list[str] = Field(default_factory=list)
    people: list[str] = Field(default_factory=list)
    competitions: list[str] = Field(default_factory=list)


class ReelAnalysis(BaseModel):
    """Gemini's three requested outputs for one exact transcript."""

    title: str = ""
    summary: str
    english_transcript: str = ""
    summary_points: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    sources: list[MentionedSource] = Field(default_factory=list)
    details: ReelDetails = Field(default_factory=ReelDetails)


class ReelOut(BaseModel):
    reel_id: int
    platform: str
    url: str
    title: str
    author: str | None = None
    transcript: str | None = None
    caption: str | None = None
    transcript_status: Literal["verified", "ambiguous", "unavailable"] = "unavailable"
    analysis: ReelAnalysis | None = None
    analysis_error_code: str | None = None
    analysis_error: str | None = None
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


class SavedLinkIn(BaseModel):
    label: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=3, max_length=2048)


class SavedDateIn(BaseModel):
    label: str = Field(min_length=1, max_length=200)
    event_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")


class SavedLinkOut(SavedLinkIn):
    id: int
    reel_id: int
    created_at: datetime


class SavedDateOut(SavedDateIn):
    id: int
    reel_id: int
    created_at: datetime


class LinkVaultEntryIn(BaseModel):
    """A durable resource bundle saved from one reel."""

    title: str = Field(min_length=1, max_length=300)
    links: list[MentionedSource] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)


class LinkVaultEntryOut(LinkVaultEntryIn):
    id: int
    reel_id: int
    created_at: datetime
