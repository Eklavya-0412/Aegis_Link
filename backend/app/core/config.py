"""
Application configuration loaded from environment variables.

Uses pydantic-settings to validate and expose all required secrets
(Supabase credentials, Groq API key) and optional tunables such as
CORS origins.  Values are read from a `.env` file located in the
`backend/` directory.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised application settings backed by environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Supabase ──────────────────────────────────────────────────────
    supabase_url: str = "https://iwmatngjrrlrpwwlljel.supabase.co"
    supabase_anon_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWF0bmdqcnJscnB3d2xsamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzQxNTYsImV4cCI6MjEwNTU1MDE1Nn0.FVfT0dg51-OVSwHT32BdKJL35USYKeptrHbWY8y7A08"
    supabase_service_role_key: str = "dummy_service_role_key_for_dev"
    supabase_jwt_secret: str = "super_secret_jwt_key_aegis_link_2026"

    # ── Groq AI ───────────────────────────────────────────────────────
    groq_api_key: str = "gsk_dummy_groq_api_key"

    # ── Security & Encryption ─────────────────────────────────────────
    document_encryption_key: str = "aegis_link_aes256_master_key_2026_super_secret"

    # ── Application ───────────────────────────────────────────────────
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        """Return CORS origins as a list of strings."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        """Check if the application is running in development mode."""
        return self.app_env.lower() == "development"


@lru_cache()
def get_settings() -> Settings:
    """
    Return a cached singleton of the application settings.

    Using ``lru_cache`` means the `.env` file is read only once,
    at startup, rather than on every request.
    """
    return Settings()  # type: ignore[call-arg]
