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


settings = Settings()
