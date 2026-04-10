from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).resolve().parents[4] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "aged-fullstack-template"
    api_port: int = 3000
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@127.0.0.1:5432/aged_fullstack_template"
    )
    redis_url: str = "redis://127.0.0.1:6379/0"
    jwt_secret_key: str = "aged-fullstack-template-dev-secret-key-2026"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    admin_email: str = "admin@example.com"
    admin_password: str = "Admin123456!"


settings = Settings()
