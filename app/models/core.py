from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Gym(SQLModel, table=True):
    """
    Gym model for representing a climbing gym.

    Attributes:
        id (int): Primary key.
        name (str): Name of the gym.
        location (str): Location of the gym.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    location: str
    climbs: List["Climb"] = Relationship(back_populates="gym")

class User(SQLModel, table=True):
    """
    User model for representing a user.

    Attributes:
        id (int): Primary key.
        username (str): Unique username.
        email (str): User email.
        hashed_password (str): Hashed password.
        is_public (bool): Profile visibility.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_public: bool = True
    ascents: List["Ascent"] = Relationship(back_populates="user")

class Climb(SQLModel, table=True):
    """
    Climb model for representing a climb at a gym.

    Attributes:
        id (int): Primary key.
        gym_id (int): Foreign key to gym.
        color (str): Hold color.
        setter (str): Name of setter.
        section (str): Section of gym.
        setter_grade (str): Grade assigned by setter.
        date_added (datetime): Date climb was added.
        rating (int): User rating for the climb (1-5, 0 if unrated).
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    gym_id: int = Field(foreign_key="gym.id")
    color: str
    setter: str
    section: str
    setter_grade: str
    date_added: datetime
    rating: int = Field(default=0, ge=0, le=5, description="User rating (1-5), 0 if unrated.")
    gym: Optional[Gym] = Relationship(back_populates="climbs")
    ascents: List["Ascent"] = Relationship(back_populates="climb")

class Ascent(SQLModel, table=True):
    """
    Ascent model for representing a user's log of an attempt or send.

    Attributes:
        id (int): Primary key.
        user_id (int): Foreign key to user.
        climb_id (int): Foreign key to climb.
        date (datetime): Date of ascent.
        sent (bool): Whether the climb was sent.
        personal_grade (str): User's personal grade.
        quality_rating (int): User's quality rating (1-5).
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    climb_id: int = Field(foreign_key="climb.id")
    date: datetime
    sent: bool
    personal_grade: str
    quality_rating: int
    user: Optional[User] = Relationship(back_populates="ascents")
    climb: Optional[Climb] = Relationship(back_populates="ascents")
