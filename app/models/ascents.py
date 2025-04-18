from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Ascent(SQLModel, table=True):
    """
    Ascent model for logging a user's climb attempt.

    Attributes:
        id (int): Primary key.
        user_id (int): Foreign key to user.
        climb_id (int): Foreign key to climb.
        date (datetime): Date of ascent.
        grade (str): User's perceived grade.
        notes (str): Optional notes.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    climb_id: int = Field(foreign_key="climb.id")
    date: datetime = Field(default_factory=datetime.utcnow)
    grade: Optional[str] = None
    notes: Optional[str] = None
