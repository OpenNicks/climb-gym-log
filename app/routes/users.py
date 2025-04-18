from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models.core import User, Climb
from typing import List, Optional

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{username}")
def get_user_profile(username: str, session: Session = Depends(get_session)):
    """
    Get public profile for a user, including climbs and ratings.
    Args:
        username (str): Username to fetch.
        session (Session): DB session.
    Returns:
        dict: User info and activity.
    Raises:
        HTTPException: 404 if user not found.
    """
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    climbs = session.exec(select(Climb).where(Climb.setter == username)).all()
    ratings = session.exec(select(Climb).where(Climb.rating != None)).all()
    user_ratings = [c for c in ratings if getattr(c, 'rated_by', None) == username]
    return {
        "username": user.username,
        "email": user.email,
        "climbs_set": [c.id for c in climbs],
        "ratings": [{"climb_id": c.id, "rating": c.rating} for c in user_ratings],
    }
