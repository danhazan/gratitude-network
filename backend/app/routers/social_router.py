from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models.models import Follow, User
from app.utils.database import get_session
from app.utils.jwt import get_current_user
from app.utils.notifications import create_notification
import uuid

router = APIRouter()

@router.post("/users/{user_id}/follow")
def follow_user(user_id: uuid.UUID, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    user_to_follow = db.get(User, user_id)
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")

    follow = db.exec(select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user_id)).first()
    if follow:
        raise HTTPException(status_code=400, detail="You are already following this user")

    new_follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(new_follow)
    db.commit()
    db.refresh(new_follow)
    create_notification(db, user_to_follow, "follow", "New Follower!", f"{current_user.username} is now following you.", {"follower_id": str(current_user.id)})
    return {"id": str(new_follow.id), "follower_id": str(new_follow.follower_id), "following_id": str(new_follow.following_id), "status": new_follow.status, "created_at": new_follow.created_at.isoformat()}

@router.delete("/users/{user_id}/follow")
def unfollow_user(user_id: uuid.UUID, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    follow = db.exec(select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user_id)).first()
    if not follow:
        raise HTTPException(status_code=404, detail="You are not following this user")

    db.delete(follow)
    db.commit()
    return {"message": "Unfollowed user"}

@router.get("/users/me/followers")
def get_followers(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    followers = db.exec(select(Follow).where(Follow.following_id == current_user.id)).all()
    return followers

@router.get("/users/me/following")
def get_following(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    following = db.exec(select(Follow).where(Follow.follower_id == current_user.id)).all()
    return following
