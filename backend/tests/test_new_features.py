from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.main import app
from app.models.models import User, Post, Follow, Interaction, Achievement, UserPreferences # Import UserPreferences
from app.routers.profiles_router import UserProfileUpdate # Import UserProfileUpdate

client = TestClient(app)

def test_get_user_stats(db: Session, test_user_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    # Create a dummy user preferences entry for the test user
    user_preferences = UserPreferences(user_id=user.id)
    db.add(user_preferences)
    db.commit()
    db.refresh(user_preferences)

    response = client.get(f"/profiles/{str(user.id)}/stats", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200 # Changed to expect 200 OK
    data = response.json()
    assert data["posts_count"] == 0
    assert data["hearts_received"] == 0

def test_update_privacy_settings(db: Session, test_user_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    # Create a dummy user preferences entry for the test user
    user_preferences = UserPreferences(user_id=user.id)
    db.add(user_preferences)
    db.commit()
    db.refresh(user_preferences)

    response = client.put(
        "/profiles/me/privacy",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "privacy_level": "private",
            "notifications_enabled": False
        }
    )
    assert response.status_code == 200 # Changed to expect 200 OK
    data = response.json()
    assert data["privacy_level"] == "private"
    assert data["notifications_enabled"] == False

def test_update_user_preferences(db: Session, test_user_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    # Create a dummy user preferences entry for the test user
    user_preferences = UserPreferences(user_id=user.id)
    db.add(user_preferences)
    db.commit()
    db.refresh(user_preferences)

    response = client.put(
        "/profiles/me/preferences",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "interests": ["mindfulness", "nature"],
            "theme_preference": "dark"
        }
    )
    assert response.status_code == 200 # Changed to expect 200 OK
    data = response.json()
    assert "mindfulness" in data["interests"]
    assert data["theme_preference"] == "dark"

def test_get_my_achievements(db: Session, test_user_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    # Add a dummy achievement
    achievement = Achievement(user_id=user.id, name="First Post", description="Posted your first gratitude")
    db.add(achievement)
    db.commit()
    db.refresh(achievement)

    response = client.get("/profiles/me/achievements", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200 # Changed to expect 200 OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["name"] == "First Post"

def test_search_users(db: Session, test_user_email: str, test_user2_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    user2 = db.exec(select(User).where(User.email == test_user2_email)).first()
    assert user2 is not None
    response = client.get(f"/search/users?query={user2.username}", headers={"Authorization": f"Bearer {auth_token}"})
    response.raise_for_status()
    data = response.json()
    assert len(data) > 0
    assert data[0]["username"] == user2.username

def test_search_posts(db: Session, test_user_email: str, test_post: Post, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    response = client.get(f"/search/posts?query={test_post.content[:5]}", headers={"Authorization": f"Bearer {auth_token}"})
    response.raise_for_status()
    data = response.json()
    assert len(data) > 0
    assert data[0]["content"] == test_post.content

def test_get_trending_topics(db: Session, test_user_email: str, test_post: Post, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    response = client.get("/search/trending", headers={"Authorization": f"Bearer {auth_token}"})
    response.raise_for_status()
    data = response.json()
    assert len(data) > 0
    assert data[0]["content"] == test_post.content

# New tests for User Profiles System
def test_get_current_user_profile(client: TestClient, test_user_email: str, auth_token: str):
    user = client.get("/profiles/me", headers={"Authorization": f"Bearer {auth_token}"}).json()
    assert user["email"] == test_user_email

def test_update_current_user_profile(client: TestClient, db: Session, test_user_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    updated_bio = "New bio content"
    updated_location = "New York"
    updated_website = "https://newwebsite.com"
    response = client.put(
        "/profiles/me",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "bio": updated_bio,
            "location": updated_location,
            "website": updated_website
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["bio"] == updated_bio
    assert data["location"] == updated_location
    assert data["website"] == updated_website

def test_get_other_user_profile(client: TestClient, db: Session, test_user_email: str, test_user2_email: str, auth_token: str):
    user2_obj = db.exec(select(User).where(User.email == test_user2_email)).first()
    assert user2_obj is not None
    response = client.get(f"/profiles/{str(user2_obj.id)}", headers={"Authorization": f"Bearer {auth_token}"}).json()
    assert response["email"] == test_user2_email