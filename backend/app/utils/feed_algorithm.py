from sqlmodel import Session, select
from app.models.models import Post, User, Follow, Interaction
from datetime import datetime, timedelta, timezone
from typing import Optional

def calculate_post_score(post: Post, db: Session, current_user: Optional[User] = None):
    # Engagement scoring
    hearts = len(db.exec(select(Interaction).where(Interaction.post_id == post.id, Interaction.interaction_type == "heart")).all())
    comments = len(db.exec(select(Interaction).where(Interaction.post_id == post.id, Interaction.interaction_type == "comment")).all())
    shares = len(db.exec(select(Interaction).where(Interaction.post_id == post.id, Interaction.interaction_type == "share")).all())

    score = (hearts * 1.0) + (comments * 2.0) + (shares * 3.0) + \
            (post.completion_rate * 1.5) - (post.reports * 10.0)

    # Content Hierarchy Rules
    if post.image_url:
        score += 2.5  # Photo Bonus

    if post.post_type == "daily_gratitude":
        score *= 3.0  # Daily Gratitude Multiplier
    elif post.post_type == "simple_text":
        score *= 0.5  # Spontaneous Text posts receive 0.5x visibility modifier

    # Recency bonus (posts in the last 24 hours get a bonus)
    # Ensure post.created_at is timezone-aware for comparison
    post_created_at_aware = post.created_at.replace(tzinfo=timezone.utc) if post.created_at.tzinfo is None else post.created_at
    if post_created_at_aware > datetime.now(timezone.utc) - timedelta(days=1):
        score += 1.0

    # Relationship Multiplier
    if current_user:
        is_followed = db.exec(select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == post.user_id)).first()
        if is_followed:
            score *= 1.5  # Boost for followed users

    return score

def get_personalized_feed(db: Session, current_user: User):
    following_ids = [f.following_id for f in db.exec(select(Follow).where(Follow.follower_id == current_user.id)).all()]
    
    # Include posts from followed users and a general pool for discovery
    posts_from_followed = db.exec(select(Post).where(Post.user_id.in_(following_ids))).all()
    
    # For discovery, get some popular posts not from followed users
    all_posts = db.exec(select(Post)).all()
    discovery_posts = [p for p in all_posts if p.user_id not in following_ids]

    # Combine and score posts
    scored_posts = []
    for post in posts_from_followed:
        score = calculate_post_score(post, db, current_user)
        scored_posts.append((post, score))
    
    for post in discovery_posts:
        score = calculate_post_score(post, db, current_user)
        scored_posts.append((post, score))

    # Sort by score (descending) and then by creation date (descending) for tie-breaking
    sorted_posts = sorted(scored_posts, key=lambda x: (x[1], x[0].created_at), reverse=True)
    
    # Return only the post objects
    return [post for post, score in sorted_posts]

def get_discovery_feed(db: Session):
    # Get all posts and score them for discovery
    all_posts = db.exec(select(Post)).all()
    scored_posts = []
    for post in all_posts:
        score = calculate_post_score(post, db)
        scored_posts.append((post, score))

    # Sort by score (descending) and then by creation date (descending)
    sorted_posts = sorted(scored_posts, key=lambda x: (x[1], x[0].created_at), reverse=True)
    
    # Return only the post objects, limit to 50 as per PRD
    return [post for post, score in sorted_posts][:50]

def get_topic_feed(db: Session, topic: str):
    # Basic topic feed: search for topic in post content
    posts = db.exec(select(Post).where(Post.content.contains(topic))).all()
    scored_posts = []
    for post in posts:
        score = calculate_post_score(post, db)
        scored_posts.append((post, score))
    
    sorted_posts = sorted(scored_posts, key=lambda x: (x[1], x[0].created_at), reverse=True)
    return [post for post, score in sorted_posts]
