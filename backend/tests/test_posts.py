import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from app.main import app
from app.models.models import Post, User
from app.routers.auth_router import get_session
from app.utils.security import hash_password
import app.utils.jwt as jwt

DATABASE_URL = "sqlite:///test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    from app.utils.security import hash_password
    user = User(email="test@example.com", username="testuser", password_hash=hash_password("password"), email_verified=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def test_create_post(client: TestClient, test_user: User):
    access_token = jwt.create_access_token(data={"sub": test_user.email})

    response = client.post(
        "/posts",
        json={"content": "I am grateful for this test.", "post_type": "daily"},
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "I am grateful for this test."
    assert data["user_id"] == str(test_user.id)

def test_get_posts(client: TestClient, session: Session, test_user: User):
    post1 = Post(content="Post 1", user_id=test_user.id)
    post2 = Post(content="Post 2", user_id=test_user.id)
    session.add(post1)
    session.add(post2)
    session.commit()

    response = client.get("/posts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2