from sqlmodel import create_engine, SQLModel, Session
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./climb_gym_log.db")
engine = create_engine(DATABASE_URL, echo=True)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get a SQLModel session.

    Yields:
        Session: SQLModel database session.
    """
    with Session(engine) as session:
        yield session

def init_db():
    """
    Initialize the database and create all tables.
    """
    SQLModel.metadata.create_all(engine)
