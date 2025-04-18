from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    """
    Schema for creating a new user.
    """
    username: constr(min_length=3, max_length=32)
    email: EmailStr
    password: constr(min_length=8)
    is_public: Optional[bool] = True

class UserRead(BaseModel):
    """
    Schema for reading user data (safe for public exposure).
    """
    id: int
    username: str
    email: EmailStr
    is_public: bool

class GymCreate(BaseModel):
    name: str
    location: str

class GymRead(BaseModel):
    id: int
    name: str
    location: str

class ClimbCreate(BaseModel):
    gym_id: int
    color: str
    setter: str
    section: str
    setter_grade: str
    date_added: datetime
    rating: int = 0  # 1-5, 0 if unrated

class ClimbRead(BaseModel):
    id: int
    gym_id: int
    color: str
    setter: str
    section: str
    setter_grade: str
    date_added: datetime
    rating: int = 0  # 1-5, 0 if unrated

class AscentCreate(BaseModel):
    user_id: int
    climb_id: int
    date: datetime
    sent: bool
    personal_grade: str
    quality_rating: int

class AscentRead(BaseModel):
    id: int
    user_id: int
    climb_id: int
    date: datetime
    sent: bool
    personal_grade: str
    quality_rating: int
