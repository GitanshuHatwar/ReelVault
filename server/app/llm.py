import os
from typing import Literal

from langchain.chat_models import init_chat_model

from app.config import get_settings
from app.errors import PipelineError


def get_llm(kind: Literal["fast", "main"] = "main"):
    s = get_settings()
    if not s.gemini_api_key:
        raise PipelineError("llm_unconfigured")
    os.environ.setdefault("GOOGLE_API_KEY", s.gemini_api_key)
    model = s.llm_model_fast if kind == "fast" else s.llm_model_main
    return init_chat_model(
        model if ":" in model else f"google_genai:{model}",
        api_key=s.gemini_api_key,
        temperature=0,
        max_retries=s.llm_max_retries,
    )
