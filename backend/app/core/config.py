from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    project_name: str = "aged-fullstack-template"
    api_port: int = 3000
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@127.0.0.1:5432/aged_fullstack_template"
    )
    redis_url: str = "redis://127.0.0.1:6379/0"


settings = Settings()
