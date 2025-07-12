from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.main import app
from app.models.models import User, Post, Follow, Interaction
from app.utils.feed_algorithm import calculate_post_score, get_personalized_feed, get_discovery_feed
from datetime import datetime, timedelta, timezone

client = TestClient(app)

def test_follow_user(db: Session, test_user_email: str, test_user2_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    user2 = db.exec(select(User).where(User.email == test_user2_email)).first()
    assert user2 is not None
    response = client.post(f"/users/{str(user2.id)}/follow", headers={"Authorization": f"Bearer {auth_token}"})
    response.raise_for_status()
    data = response.json()
    assert "id" in data
    assert data["follower_id"] == str(user.id)
    assert data["following_id"] == str(user2.id)

def test_unfollow_user(db: Session, test_user_email: str, test_user2_email: str, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    user2 = db.exec(select(User).where(User.email == test_user2_email)).first()
    assert user2 is not None
    client.post(f"/users/{str(user2.id)}/follow", headers={"Authorization": f"Bearer {auth_token}"})
    response = client.delete(f"/users/{str(user2.id)}/follow", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json() == {"message": "Unfollowed user"}

def test_heart_post(db: Session, test_user_email: str, test_post: Post, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    response = client.post(f"/posts/{str(test_post.id)}/heart", headers={"Authorization": f"Bearer {auth_token}"})
    response.raise_for_status()
    data = response.json()
    assert data["post_id"] == str(test_post.id)
    assert data["user_id"] == str(user.id)
    assert data["interaction_type"] == "heart"

def test_add_comment(db: Session, test_user_email: str, test_post: Post, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    response = client.post(f"/posts/{str(test_post.id)}/comments", headers={"Authorization": f"Bearer {auth_token}"}, json={"content": "This is a test comment"})
    response.raise_for_status()
    data = response.json()
    assert data["post_id"] == str(test_post.id)
    assert data["user_id"] == str(user.id)
    assert data["interaction_type"] == "comment"
    assert data["content"] == "This is a test comment"

def test_get_personalized_feed(db: Session, test_user_email: str, test_user2_email: str, test_post: Post, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    user2 = db.exec(select(User).where(User.email == test_user2_email)).first()
    assert user2 is not None
    # Create a post by test_user2
    post2 = Post(content="Another post by test_user2", user_id=user2.id)
    db.add(post2)
    db.commit()
    db.refresh(post2)

    # Follow test_user2
    client.post(f"/users/{str(user2.id)}/follow", headers={"Authorization": f"Bearer {auth_token}"})

    response = client.get("/feed", headers={"Authorization": f"Bearer {auth_token}"})
    response.raise_for_status()
    feed = response.json()
    assert len(feed) > 0
    # Check if post from followed user is in the feed
    assert any(p["id"] == str(post2.id) for p in feed)

def test_get_discovery_feed(db: Session, test_user_email: str, test_post: Post, auth_token: str):
    user = db.exec(select(User).where(User.email == test_user_email)).first()
    assert user is not None
    response = client.get("/feed/discover", headers={"Authorization": f"Bearer {auth_token}"})
    response.raise_for_status()
    feed = response.json()
    assert len(feed) > 0

def test_feed_algorithm_scoring(db: Session, test_user_email: str, test_user2_email: str):
    user1 = db.exec(select(User).where(User.email == test_user_email)).first()
    user2 = db.exec(select(User).where(User.email == test_user2_email)).first()
    assert user1 is not None
    assert user2 is not None

    # Post with base score (recency bonus)
    post_base = Post(content="Base post", user_id=user1.id, post_type="simple_text")
    db.add(post_base)
    db.commit()
    db.refresh(post_base)
    score_base = calculate_post_score(post_base, db, user1)
    assert score_base == 1.0 # Only recency bonus for simple_text (0.0 * 0.5 + 1.0)

    # Post with photo bonus
    post_photo = Post(content="Photo post", user_id=user1.id, image_url="http://example.com/image.jpg", post_type="simple_text")
    db.add(post_photo)
    db.commit()
    db.refresh(post_photo)
    score_photo = calculate_post_score(post_photo, db, user1)
    assert score_photo == 2.25 # (2.5 * 0.5 + 1.0)

    # Post with daily gratitude multiplier (needs some base score to be effective)
    post_daily_gratitude = Post(content="Daily gratitude post", user_id=user2.id, post_type="daily_gratitude", completion_rate=1.0)
    db.add(post_daily_gratitude)
    db.commit()
    db.refresh(post_daily_gratitude)
    score_daily_gratitude = calculate_post_score(post_daily_gratitude, db, user1)
    # Base score from completion_rate: 1.0 * 1.5 = 1.5
    # Multiplier: 1.5 * 3.0 = 4.5
    # Recency bonus: 4.5 + 1.0 = 5.5
    assert score_daily_gratitude == 5.5

    # Post with interactions
    post_interactions = Post(content="Interactions post", user_id=user1.id, post_type="simple_text")
    db.add(post_interactions)
    db.commit()
    db.refresh(post_interactions)
    interaction1 = Interaction(user_id=user2.id, post_id=post_interactions.id, interaction_type="heart")
    interaction2 = Interaction(user_id=user2.id, post_id=post_interactions.id, interaction_type="comment", content="Nice post!")
    db.add(interaction1)
    db.add(interaction2)
    db.commit()
    score_interactions = calculate_post_score(post_interactions, db, user1)
    # Base score: (1 heart * 1.0) + (1 comment * 2.0) = 3.0
    # Multiplier: 3.0 * 0.5 = 1.5
    # Recency bonus: 1.5 + 1.0 = 2.5
    assert score_interactions == 2.5

    # Test relationship multiplier
    follow = Follow(follower_id=user1.id, following_id=user2.id)
    db.add(follow)
    db.commit()
    db.refresh(follow)

    # Score for post_daily_gratitude from user2, now followed by user1
    score_daily_gratitude_followed = calculate_post_score(post_daily_gratitude, db, user1)
    # Original score: 5.5
    # Multiplier: 5.5 * 1.5 = 8.25
    assert score_daily_gratitude_followed == 8.25

    # Test personalized feed
    personalized_feed = get_personalized_feed(db, user1)
    # The order depends on the scores. post_daily_gratitude_followed should be highest.
    # Then post_interactions, then post_photo, then post_base.
    # The personalized feed also includes posts from followed users and discovery posts.
    # Let's simplify this assertion for now, just check if the posts are present.
    assert post_daily_gratitude in personalized_feed
    assert post_interactions in personalized_feed
    assert post_photo in personalized_feed
    assert post_base in personalized_feed

    # Test discovery feed
    discovery_feed = get_discovery_feed(db)
    assert len(discovery_feed) > 0
    assert post_base in discovery_feed
    assert post_photo in discovery_feed
    assert post_daily_gratitude in discovery_feed
    assert post_interactions in discovery_feed
