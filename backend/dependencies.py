from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from backend.config import settings


@lru_cache(maxsize=1)
def _create_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase() -> Client:
    """FastAPI dependency that provides a Supabase client."""
    return _create_supabase_client()
