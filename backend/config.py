from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    bloomreach_api_url: str = "https://api.exponea.com"
    bloomreach_project_token: str = ""
    bloomreach_api_key_id: str = ""
    bloomreach_api_secret: str = ""
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    app_env: str = "development"
    sync_interval_hours: int = 6
    default_comparison_window_days: int = 14

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
