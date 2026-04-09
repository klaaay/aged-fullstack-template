from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.platform.config.settings import settings


engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
