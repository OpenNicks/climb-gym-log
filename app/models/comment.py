from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    climb_id: int = Field(index=True)
    user_id: int = Field(index=True)
    username: str
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
