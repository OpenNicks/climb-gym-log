from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.db import get_session
from app.models.comment import Comment
from app.models.core import Climb, User
from app.schemas.comment import CommentCreate, CommentRead
from app.auth import get_current_user

router = APIRouter(prefix="/climbs", tags=["comments"])

from fastapi import Query
from pydantic import conint

@router.get("/{climb_id}/comments", response_model=List[CommentRead])
def list_comments(
    climb_id: int,
    session: Session = Depends(get_session),
    limit: conint(ge=1, le=100) = Query(10, description="Max results to return (1-100)"),
    offset: conint(ge=0) = Query(0, description="Results to skip (pagination)")
):
    """
    List comments for a climb with pagination.
    """
    try:
        comments = session.exec(
            select(Comment)
            .where(Comment.climb_id == climb_id)
            .order_by(Comment.created_at)
            .offset(offset)
            .limit(limit)
        ).all()
        return comments
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "internal_error", "message": str(e)})

@router.post("/{climb_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def add_comment(climb_id: int, comment: CommentCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """
    Add a comment to a climb (auth required).
    """
    climb = session.get(Climb, climb_id)
    if not climb:
        raise HTTPException(status_code=404, detail="Climb not found")
    db_comment = Comment(
        climb_id=climb_id,
        user_id=current_user.id,
        username=current_user.username,
        text=comment.text,
    )
    session.add(db_comment)
    session.commit()
    session.refresh(db_comment)
    return db_comment

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """
    Delete a comment (only author or admin).
    """
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this comment")
    session.delete(comment)
    session.commit()
    return None
