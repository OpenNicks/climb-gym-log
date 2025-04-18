from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.db import get_session
from app.models.ascents import Ascent
from app.schemas.ascents import AscentCreate, AscentRead
from app.auth import get_current_user
from app.models.core import User

router = APIRouter(prefix="/ascents", tags=["ascents"])

@router.post("/", response_model=AscentRead, status_code=status.HTTP_201_CREATED)
def create_ascent(ascent: AscentCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_ascent = Ascent(
        user_id=current_user.id,
        climb_id=ascent.climb_id,
        date=ascent.date or None,
        grade=ascent.grade,
        notes=ascent.notes
    )
    session.add(db_ascent)
    session.commit()
    session.refresh(db_ascent)
    return db_ascent

from fastapi import Query
from pydantic import conint

@router.get("/", response_model=List[AscentRead])
def list_user_ascents(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    limit: conint(ge=1, le=100) = Query(10, description="Max results to return (1-100)"),
    offset: conint(ge=0) = Query(0, description="Results to skip (pagination)")
):
    try:
        ascents = session.exec(
            select(Ascent)
            .where(Ascent.user_id == current_user.id)
            .offset(offset)
            .limit(limit)
        ).all()
        return ascents
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "internal_error", "message": str(e)})

@router.get("/climb/{climb_id}", response_model=List[AscentRead])
def list_ascents_for_climb(
    climb_id: int,
    session: Session = Depends(get_session),
    limit: conint(ge=1, le=100) = Query(10, description="Max results to return (1-100)"),
    offset: conint(ge=0) = Query(0, description="Results to skip (pagination)")
):
    try:
        ascents = session.exec(
            select(Ascent)
            .where(Ascent.climb_id == climb_id)
            .offset(offset)
            .limit(limit)
        ).all()
        return ascents
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "internal_error", "message": str(e)})
