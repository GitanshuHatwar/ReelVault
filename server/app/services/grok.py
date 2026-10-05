"""xAI Grok Responses API with server-side web_search."""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

from app.config import get_settings
from app.errors import PipelineError

XAI_RESPONSES_URL = "https://api.x.ai/v1/responses"


def grok_web_search(system: str, user: str, *, timeout_s: int) -> tuple[str, list[str], int]:
    """Ask Grok to search the web and answer. Returns (text, citation urls, tool-call count)."""
    settings = get_settings()
    if not settings.xai_api_key:
        raise PipelineError("grok_unconfigured")

    payload = {
        "model": settings.grok_model,
        "input": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "tools": [{"type": "web_search"}],
        "store": False,
    }
    try:
        response = httpx.post(
            XAI_RESPONSES_URL,
            headers={
                "Authorization": f"Bearer {settings.xai_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=timeout_s,
        )
    except httpx.TimeoutException as exc:
        raise PipelineError("search_unavailable") from exc
    except httpx.HTTPError as exc:
        raise PipelineError("search_unavailable") from exc

    if response.status_code == 429:
        raise PipelineError("ai_rate_limited")
    if response.status_code in {401, 403}:
        raise PipelineError("grok_unconfigured")
    if response.status_code >= 400:
        raise PipelineError("search_unavailable")

    data = response.json()
    text = _output_text(data)
    citations = _citations(data)
    calls = _tool_calls(data)
    if not text:
        raise PipelineError("search_unavailable")
    return text, citations, calls


def parse_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start < 0 or end <= start:
        raise PipelineError("internal_error")
    try:
        parsed = json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError as exc:
        raise PipelineError("internal_error") from exc
    if not isinstance(parsed, dict):
        raise PipelineError("internal_error")
    return parsed


def _output_text(data: dict[str, Any]) -> str:
    chunks: list[str] = []
    if isinstance(data.get("output_text"), str) and data["output_text"].strip():
        chunks.append(data["output_text"])
    for item in data.get("output") or []:
        if not isinstance(item, dict):
            continue
        if item.get("type") == "message":
            for part in item.get("content") or []:
                if isinstance(part, dict) and part.get("type") in {"output_text", "text"}:
                    text = part.get("text") or ""
                    if text:
                        chunks.append(text)
        elif item.get("type") in {"output_text", "text"}:
            text = item.get("text") or ""
            if text:
                chunks.append(text)
    return "\n".join(chunks).strip()


def _citations(data: dict[str, Any]) -> list[str]:
    urls: list[str] = []
    for citation in data.get("citations") or []:
        if isinstance(citation, str) and citation.startswith("http"):
            urls.append(citation)
        elif isinstance(citation, dict):
            url = citation.get("url") or citation.get("uri")
            if isinstance(url, str) and url.startswith("http"):
                urls.append(url)
    for item in data.get("output") or []:
        if not isinstance(item, dict):
            continue
        for part in item.get("content") or []:
            if not isinstance(part, dict):
                continue
            for annotation in part.get("annotations") or []:
                if not isinstance(annotation, dict):
                    continue
                url = annotation.get("url")
                if isinstance(url, str) and url.startswith("http"):
                    urls.append(url)
    return list(dict.fromkeys(urls))


def _tool_calls(data: dict[str, Any]) -> int:
    usage = data.get("server_side_tool_usage") or {}
    if isinstance(usage, dict):
        total = sum(int(value) for value in usage.values() if isinstance(value, (int, float)))
        if total:
            return total
    count = 0
    for item in data.get("output") or []:
        if isinstance(item, dict) and "search" in str(item.get("type") or "").lower():
            count += 1
    return count
