from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.schemas.core import UserCreate, UserRead
from app.models.core import User
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.db import get_session
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, session: Session = Depends(get_session)):
    import traceback
    try:
        if session.exec(select(User).where(User.username == user.username)).first():
            raise HTTPException(status_code=400, detail="Username already registered")
        if session.exec(select(User).where(User.email == user.email)).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=get_password_hash(user.password),
            is_public=user.is_public
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user
    except Exception as e:
        with open("register_errors.log", "a") as f:
            f.write("[REGISTER ERROR] " + str(e) + "\n")
            import traceback as tb
            tb.print_exc(file=f)
        print("[REGISTER ERROR]", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
