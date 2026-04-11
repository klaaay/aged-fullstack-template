from alembic import command
from alembic.config import Config

from app.platform.config.settings import settings


def main() -> None:
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(config, "head")


if __name__ == "__main__":
    main()
