from sqlmodel import Field, SQLModel, Relationship
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Column, UniqueConstraint
from sqlalchemy.types import JSON as SQLAlchemyJSON
from pydantic import ConfigDict

class User(SQLModel, table=True):
    model_config = ConfigDict(ignored_types=(SQLAlchemyJSON,))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    password_hash: str
    oauth_provider: str | None = None
    oauth_id: str | None = None
    email_verified: bool = False
    profile_image_url: str | None = None
    bio: str | None = Field(default=None, index=True)
    location: str | None = None # Added location field
    website: str | None = None # Added website field
    posts_count: int = 0
    hearts_received: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: datetime | None = None

    posts: List["Post"] = Relationship(back_populates="user")
    preferences: Optional["UserPreferences"] = Relationship(back_populates="user")
    interactions: List["Interaction"] = Relationship(back_populates="user")
    followers: List["Follow"] = Relationship(back_populates="following", sa_relationship_kwargs=dict(foreign_keys="[Follow.following_id]"))
    following: List["Follow"] = Relationship(back_populates="follower", sa_relationship_kwargs=dict(foreign_keys="[Follow.follower_id]"))
    notifications: List["Notification"] = Relationship(back_populates="user")
    achievements: List["Achievement"] = Relationship(back_populates="user")

class Post(SQLModel, table=True):
    model_config = ConfigDict(ignored_types=(SQLAlchemyJSON,))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    content: str = Field(index=True)
    image_url: str | None = None
    location_data: dict | None = Field(default=None, sa_column=Column(SQLAlchemyJSON))
    post_type: str = "simple_text"
    is_draft: bool = False
    scheduled_for: datetime | None = None
    completion_rate: float = 0.0
    reports: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: datetime | None = None

    user: "User" = Relationship(back_populates="posts")
    interactions: List["Interaction"] = Relationship(back_populates="post")

class Interaction(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", "interaction_type", name="unique_user_post_interaction"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    post_id: uuid.UUID = Field(foreign_key="post.id")
    interaction_type: str # heart, comment
    content: str | None = None # For comments
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship(back_populates="interactions")
    post: "Post" = Relationship(back_populates="interactions")

class Follow(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("follower_id", "following_id", name="unique_follower_following"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    follower_id: uuid.UUID = Field(foreign_key="user.id")
    following_id: uuid.UUID = Field(foreign_key="user.id")
    status: str = "active" # active, pending, blocked
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    follower: "User" = Relationship(back_populates="following", sa_relationship_kwargs=dict(foreign_keys="[Follow.follower_id]"))
    following: "User" = Relationship(back_populates="followers", sa_relationship_kwargs=dict(foreign_keys="[Follow.following_id]"))

class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    type: str
    title: str
    message: str
    data: dict | None = Field(default=None, sa_column=Column(SQLAlchemyJSON))
    read_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship(back_populates="notifications")

class CommentCreate(SQLModel):
    content: str

class UserPreferences(SQLModel, table=True):
    model_config = ConfigDict(ignored_types=(SQLAlchemyJSON,))
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    privacy_level: str = "public"
    notifications_enabled: bool = True
    interests: List[str] = Field(default_factory=list, sa_column=Column(SQLAlchemyJSON))
    theme_preference: str = "light"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship(back_populates="preferences")

class Achievement(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    name: str
    description: str
    achieved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship(back_populates="achievements")