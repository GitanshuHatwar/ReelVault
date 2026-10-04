from typing import Protocol

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.errors import UpstreamFailed
from app.schemas.domain import FetchedPost, PostRef


class ReelFetcher(Protocol):
    def fetch(self, ref: PostRef) -> FetchedPost: ...


class SocialKitFetcher:
    """Third-party vendor. Treat as unreliable: timeouts, retries, clear errors.

    Confirmed against SocialKit docs:
    GET {base}/{instagram|youtube|tiktok}/transcript?access_key=&url=
    Envelope: {success, data: {transcript, transcriptSegments, wordCount, ...}}.
    Caption / author / posted_at are not in the transcript contract; mapped if present.
    Do NOT use the summarize endpoint (lossy LLM summary).
    """

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(min=1, max=8),
        retry=retry_if_exception_type(httpx.TransportError),
        reraise=True,
    )
    def _call(self, path: str, url: str) -> dict:
        s = get_settings()
        r = httpx.get(
            f"{s.socialkit_base_url}{path}",
            params={"access_key": s.socialkit_api_key, "url": url},
            timeout=60,
        )
        if r.status_code >= 400:
            raise UpstreamFailed(f"transcript provider error ({r.status_code})")
        return r.json()

    def fetch(self, ref: PostRef) -> FetchedPost:
        data = self._call(f"/{ref.platform}/transcript", ref.canonical_url)
        if not data.get("success"):
            raise UpstreamFailed("transcript provider returned an unsuccessful response")
        return self._parse(data, ref)

    @staticmethod
    def _parse(data: dict, ref: PostRef) -> FetchedPost:
        d = data.get("data", {}) or {}
        transcript = d.get("transcript")
        if not transcript:
            segs = d.get("transcriptSegments") or []
            joined = " ".join((s.get("text") or "").strip() for s in segs).strip()
            transcript = joined or None
        author = d.get("author") or d.get("username") or d.get("channel")
        if isinstance(author, dict):
            author = author.get("username") or author.get("name") or author.get("handle")
        return FetchedPost(
            platform=ref.platform,
            shortcode=ref.shortcode,
            url=ref.canonical_url,
            transcript=transcript,
            caption=d.get("caption") or d.get("description"),
            author=author,
            language_hint=d.get("language") or d.get("language_hint"),
            raw=data,
        )


def get_fetcher(platform: str) -> ReelFetcher:
    return SocialKitFetcher()
