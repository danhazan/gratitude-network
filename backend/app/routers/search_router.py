from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models.models import User, Post
from app.utils.database import get_session
from app.utils.jwt import get_current_user

router = APIRouter()

@router.get("/search/users")
def search_users(query: str, db: Session = Depends(get_session)):
    users = db.exec(select(User).where(User.username.contains(query) | User.bio.contains(query))).all()
    return users

@router.get("/search/posts")
def search_posts(query: str, db: Session = Depends(get_session)):
    posts = db.exec(select(Post).where(Post.content.contains(query))).all()
    return posts

@router.get("/search/trending")
def get_trending_topics(db: Session = Depends(get_session)):
    # This is a placeholder. A real trending algorithm would be more complex.
    # For now, it returns the most recent posts as a proxy for trending.
    posts = db.exec(select(Post).order_by(Post.created_at.desc()).limit(10)).all()
    return posts
