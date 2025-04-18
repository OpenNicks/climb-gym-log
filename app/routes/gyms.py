from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel, conint
from app.db import get_session
from app.models.core import Gym, Climb
from app.schemas.core import GymCreate, GymRead, ClimbCreate, ClimbRead
from app.auth import get_current_user
from app.models.core import User

router = APIRouter(prefix="/gyms", tags=["gyms"])

@router.post("/", response_model=GymRead, status_code=status.HTTP_201_CREATED)
def create_gym(gym: GymCreate, session: Session = Depends(get_session)) -> GymRead:
    """
    Create a new gym. Checks for duplicate gym names.
    """
    existing = session.exec(select(Gym).where(Gym.name == gym.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Gym with name '{gym.name}' already exists.")
    db_gym = Gym.from_orm(gym)
    try:
        session.add(db_gym)
        session.commit()
        session.refresh(db_gym)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create gym: {str(e)}")
    return db_gym

@router.get("/", response_model=List[GymRead])
def list_gyms(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)) -> List[GymRead]:
    """
    List all gyms with pagination.
    """
    gyms = session.exec(select(Gym).offset(skip).limit(limit)).all()
    return gyms

@router.get("/{gym_id}", response_model=GymRead)
def get_gym(gym_id: int, session: Session = Depends(get_session)) -> GymRead:
    """
    Get a gym by ID.
    """
    gym = session.get(Gym, gym_id)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    return gym

@router.post("/{gym_id}/climbs/", response_model=ClimbRead, status_code=status.HTTP_201_CREATED)
def create_climb_for_gym(
    gym_id: int, 
    climb: ClimbCreate, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
) -> ClimbRead:
    """
    Create a new climb for a gym. Checks for gym existence and handles DB errors. Requires authentication.
    """
    gym = session.get(Gym, gym_id)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    db_climb = Climb.from_orm(climb)
    db_climb.gym_id = gym_id
    try:
        session.add(db_climb)
        session.commit()
        session.refresh(db_climb)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create climb: {str(e)}")
    return db_climb

@router.get("/{gym_id}/climbs/", response_model=List[ClimbRead])
def list_climbs_for_gym(gym_id: int, skip: int = 0, limit: int = 100, session: Session = Depends(get_session)) -> List[ClimbRead]:
    """
    List all climbs for a gym with pagination.
    """
    climbs = session.exec(select(Climb).where(Climb.gym_id == gym_id).offset(skip).limit(limit)).all()
    return climbs

class ClimbRatingUpdate(BaseModel):
    rating: conint(ge=1, le=5)

@router.patch("/climbs/{climb_id}/rating", response_model=ClimbRead)
def update_climb_rating(
    climb_id: int, 
    rating_update: ClimbRatingUpdate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> ClimbRead:
    """
    Update the rating for a climb. Requires authentication.
    Args:
        climb_id (int): The climb's ID.
        rating_update (ClimbRatingUpdate): The new rating (1-5).
        session (Session): DB session.
        current_user (User): The authenticated user.
    Returns:
        ClimbRead: The updated climb.
    Raises:
        HTTPException: 404 if not found.
    """
    climb = session.get(Climb, climb_id)
    if not climb:
        raise HTTPException(status_code=404, detail="Climb not found")
    climb.rating = rating_update.rating
    session.add(climb)
    session.commit()
    session.refresh(climb)
    return climb
