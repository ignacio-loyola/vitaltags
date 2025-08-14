from sqlmodel import create_engine, SQLModel, Session
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20,
)


def get_session():
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session


def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)