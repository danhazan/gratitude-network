import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
import httpx
from typing import Optional

from app.main import app
from app.models.models import User, Post, Interaction, Follow, Notification, UserPreferences, Achievement
from app.routers.auth_router import get_session

# Use an in-memory SQLite database for testing
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})


@pytest.fixture(name="db")
def db_fixture():
    SQLModel.metadata.create_all(engine)  # Create tables
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)  # Drop tables after tests


@pytest.fixture(name="client")
def client_fixture(db: Session):
    def get_session_override():
        return db

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user_email") # Changed fixture name
def test_user_email_fixture(db: Session):
    # Create a test user and return their email
    from app.utils.security import hash_password
    user = User(email="test@example.com", username="testuser", password_hash=hash_password("password"), email_verified=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user.email

@pytest.fixture(name="test_user2_email") # Changed fixture name
def test_user2_email_fixture(db: Session):
    # Create a second test user and return their email
    from app.utils.security import hash_password
    user = User(email="test2@example.com", username="testuser2", password_hash=hash_password("password"), email_verified=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user.email

@pytest.fixture(name="test_post")
def test_post_fixture(client: TestClient, db: Session, test_user_email: str): # Updated to use test_user_email
    from app.models.models import Post
    user = db.exec(select(User).where(User.email == test_user_email)).first() # Fetch user from session
    post = Post(content="This is a test post", user_id=user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@pytest.fixture(name="auth_token")
def auth_token_fixture(client: TestClient, test_user_email: str): # Updated to use test_user_email
    # Log in the test user and return an access token
    response = client.post(
        "/auth/login",
        json={"email": test_user_email, "password": "password"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]
