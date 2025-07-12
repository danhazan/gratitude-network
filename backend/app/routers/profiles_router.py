from typing import Optional, List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from datetime import datetime # Added datetime import

from app.models.models import User, UserPreferences, Achievement # Import UserPreferences and Achievement
from app.routers.auth_router import get_session
from app.utils.jwt import get_current_user

router = APIRouter()

class UserProfile(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    posts_count: int
    hearts_received: int

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

class PrivacySettingsUpdate(BaseModel):
    privacy_level: Optional[str] = None
    notifications_enabled: Optional[bool] = None

class UserPreferencesUpdate(BaseModel):
    interests: Optional[List[str]] = None
    theme_preference: Optional[str] = None

class UserStats(BaseModel):
    posts_count: int
    hearts_received: int

    class Config:
        from_attributes = True

class AchievementResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    achieved_at: datetime

    class Config:
        from_attributes = True

@router.get("/profiles/me", response_model=UserProfile)
def read_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.put("/profiles/me", response_model=UserProfile)
def update_current_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    for field, value in profile_update.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    session.commit()
    return current_user

@router.get("/profiles/{user_id}", response_model=UserProfile)
def read_user_profile(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/profiles/me/privacy", response_model=UserPreferences)
def update_privacy_settings(
    privacy_update: PrivacySettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    user_preferences = session.exec(select(UserPreferences).where(UserPreferences.user_id == current_user.id)).first()
    if not user_preferences:
        user_preferences = UserPreferences(user_id=current_user.id) # Create if not exists
        session.add(user_preferences)

    for field, value in privacy_update.model_dump(exclude_unset=True).items():
        setattr(user_preferences, field, value)
    
    session.add(user_preferences)
    session.commit()
    session.refresh(user_preferences)
    return user_preferences

@router.put("/profiles/me/preferences", response_model=UserPreferences)
def update_user_preferences(
    preferences_update: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    user_preferences = session.exec(select(UserPreferences).where(UserPreferences.user_id == current_user.id)).first()
    if not user_preferences:
        user_preferences = UserPreferences(user_id=current_user.id) # Create if not exists
        session.add(user_preferences)

    for field, value in preferences_update.model_dump(exclude_unset=True).items():
        setattr(user_preferences, field, value)
    
    session.add(user_preferences)
    session.commit()
    session.refresh(user_preferences)
    return user_preferences

@router.get("/profiles/me/achievements", response_model=List[AchievementResponse])
def get_my_achievements(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    achievements = session.exec(select(Achievement).where(Achievement.user_id == current_user.id)).all()
    return achievements

@router.get("/profiles/{user_id}/stats", response_model=UserStats)
def get_user_stats(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
