from sqlmodel import Session
from app.models.models import Notification, User
from datetime import datetime, timezone

def create_notification(
    db: Session,
    user: User,
    notification_type: str,
    title: str,
    message: str,
    data: dict = None,
):
    notification = Notification(
        user_id=user.id,
        type=notification_type,
        title=title,
        message=message,
        data=data,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
