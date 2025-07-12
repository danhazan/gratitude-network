from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models.models import Interaction, Post, User, CommentCreate
from app.utils.database import get_session
from app.utils.jwt import get_current_user
from app.utils.notifications import create_notification
import uuid

router = APIRouter()

@router.post("/posts/{post_id}/heart")
def heart_post(post_id: uuid.UUID, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Rate limiting would be implemented in a middleware
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    interaction = db.exec(select(Interaction).where(Interaction.post_id == post_id, Interaction.user_id == current_user.id, Interaction.interaction_type == "heart")).first()
    if interaction:
        raise HTTPException(status_code=400, detail="Post already hearted")

    new_interaction = Interaction(user_id=current_user.id, post_id=post_id, interaction_type="heart")
    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    create_notification(db, post.user, "heart", "New Heart!", f"{current_user.username} hearted your post.", {"post_id": str(post.id), "user_id": str(current_user.id)})
    return {"id": str(new_interaction.id), "user_id": str(new_interaction.user_id), "post_id": str(new_interaction.post_id), "interaction_type": new_interaction.interaction_type, "created_at": new_interaction.created_at.isoformat()}

@router.delete("/posts/{post_id}/heart")
def unheart_post(post_id: uuid.UUID, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    interaction = db.exec(select(Interaction).where(Interaction.post_id == post_id, Interaction.user_id == current_user.id, Interaction.interaction_type == "heart")).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Heart not found")

    db.delete(interaction)
    db.commit()
    return {"message": "Heart removed"}

@router.post("/posts/{post_id}/comments")
def add_comment(post_id: uuid.UUID, comment: CommentCreate, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Add positive-only content validation here
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = Interaction(user_id=current_user.id, post_id=post_id, interaction_type="comment", content=comment.content)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    create_notification(db, post.user, "comment", "New Comment!", f"{current_user.username} commented on your post: {comment.content[:50]}...", {"post_id": str(post.id), "user_id": str(current_user.id)})
    return {"id": str(new_comment.id), "user_id": str(new_comment.user_id), "post_id": str(new_comment.post_id), "interaction_type": new_comment.interaction_type, "content": new_comment.content, "created_at": new_comment.created_at.isoformat()}

@router.get("/posts/{post_id}/comments")
def get_comments(post_id: uuid.UUID, db: Session = Depends(get_session)):
    comments = db.exec(select(Interaction).where(Interaction.post_id == post_id, Interaction.interaction_type == "comment")).all()
    return comments
