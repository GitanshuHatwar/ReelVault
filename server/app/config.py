from functools import lru_cache
from urllib.parse import urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_SUPABASE_SERVICE_PATHS = {
    "/auth/v1",
    "/functions/v1",
    "/realtime/v1",
    "/rest/v1",
    "/storage/v1",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "dev"
    cors_origins: list[str] = ["http://localhost:3000"]

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    socialkit_api_key: str
    socialkit_base_url: str = "https://api.socialkit.dev"
    tavily_api_key: str
    gemini_api_key: str

    llm_model_fast: str = "gemini-2.0-flash"
    llm_model_main: str = "gemini-2.0-flash"

    shallow_per_day: int = 50
    deep_per_day: int = 10
    verify_max_tool_calls: int = 6
    verify_timeout_s: int = 45
    research_max_tool_calls: int = 10
    research_timeout_s: int = 90
    stale_job_minutes: int = 15
    default_timezone: str = "Asia/Kolkata"

    @field_validator("supabase_url", mode="before")
    @classmethod
    def normalize_supabase_url(cls, value: object) -> object:
        """Accept the project URL even if a Supabase service endpoint was pasted."""
        if not isinstance(value, str):
            return value

        parsed = urlsplit(value.strip())
        if parsed.path.rstrip("/") not in _SUPABASE_SERVICE_PATHS:
            return value.strip().rstrip("/")

        # supabase-py appends service paths such as `/rest/v1` itself.
        return urlunsplit((parsed.scheme, parsed.netloc, "", "", ""))


@lru_cache
def get_settings() -> Settings:
    return Settings()
