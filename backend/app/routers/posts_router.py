
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import selectinload

from app.models.models import Post, User
from .auth_router import get_session
from app.utils.middleware import get_current_user
from app.utils.validation import validate_post_content
from app.utils.image_utils import save_upload_file, process_image, UPLOAD_DIR

router = APIRouter()

class PostCreate(BaseModel):
    content: str
    post_type: str = "simple_text"
    is_draft: bool = False
    scheduled_for: Optional[datetime] = None

class PostUpdate(BaseModel):
    content: Optional[str] = None
    is_draft: Optional[bool] = None

@router.post("/posts", status_code=201)
def create_post(post_data: PostCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    validate_post_content(post_data.content)
    new_post = Post(
        user_id=current_user.id,
        content=post_data.content,
        post_type=post_data.post_type,
        is_draft=post_data.is_draft,
        scheduled_for=post_data.scheduled_for
    )
    session.add(new_post)
    session.commit()
    session.refresh(new_post)
    return new_post

@router.get("/posts", response_model=List[Post])
def list_posts(skip: int = 0, limit: int = Query(default=10, lte=100), session: Session = Depends(get_session)):
    posts = session.exec(select(Post).offset(skip).limit(limit)).all()
    return posts

@router.get("/users/{user_id}/posts", response_model=List[Post])
def get_user_posts(user_id: str, session: Session = Depends(get_session)):
    posts = session.exec(select(Post).where(Post.user_id == user_id).options(selectinload(Post.user))).all()
    return posts

@router.get("/posts/drafts", response_model=List[Post])
def get_draft_posts(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    drafts = session.exec(select(Post).where(Post.user_id == current_user.id, Post.is_draft == True)).all()
    return drafts

@router.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: str, session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/posts/{post_id}")
def edit_post(post_id: str, post_data: PostUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post or post.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post not found")

    if datetime.now(timezone.utc) - post.created_at > timedelta(hours=24):
        raise HTTPException(status_code=403, detail="Cannot edit posts older than 24 hours")

    if post_data.content:
        validate_post_content(post_data.content)
        post.content = post_data.content
    if post_data.is_draft is not None:
        post.is_draft = post_data.is_draft
    
    post.updated_at = datetime.utcnow()
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.post("/posts/{post_id}/image")
def upload_post_image(post_id: str, file: UploadFile = File(...), current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post or post.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post not found")

    file_path = UPLOAD_DIR / f"post_{post.id}.jpg"
    save_upload_file(file, file_path)
    process_image(file_path)

    post.image_url = str(file_path)
    session.add(post)
    session.commit()
    return {"message": "Image uploaded successfully"}
