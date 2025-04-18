from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentCreate(BaseModel):
    text: str

class CommentRead(BaseModel):
    id: int
    climb_id: int
    user_id: int
    username: str
    text: str
    created_at: datetime
