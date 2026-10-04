from typing import Literal

from langchain.chat_models import init_chat_model

from app.config import get_settings


def get_llm(kind: Literal["fast", "main"] = "main"):
    s = get_settings()
    model = s.llm_model_fast if kind == "fast" else s.llm_model_main
    return init_chat_model(
        model,
        model_provider="google_genai",
        api_key=s.gemini_api_key,
        temperature=0,
    )
