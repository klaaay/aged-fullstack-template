from pathlib import Path

from app.platform.config.settings import Settings


def test_settings_load_env_file_values(tmp_path: Path) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "PROJECT_NAME=aged-demo",
                "API_PORT=3001",
                "DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:55432/aged_demo",
                "REDIS_URL=redis://127.0.0.1:56379/0",
            ]
        ),
        encoding="utf-8",
    )

    settings = Settings(_env_file=env_file)

    assert settings.project_name == "aged-demo"
    assert settings.api_port == 3001
    assert settings.database_url == (
        "postgresql+psycopg://postgres:postgres@127.0.0.1:55432/aged_demo"
    )
    assert settings.redis_url == "redis://127.0.0.1:56379/0"
