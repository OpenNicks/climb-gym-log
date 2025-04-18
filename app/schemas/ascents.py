from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AscentBase(BaseModel):
    grade: Optional[str] = None
    notes: Optional[str] = None

class AscentCreate(AscentBase):
    climb_id: int
    date: Optional[datetime] = None

class AscentRead(AscentBase):
    id: int
    user_id: int
    climb_id: int
    date: datetime

    class Config:
        orm_mode = True
