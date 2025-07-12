from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.models.models import Post, User, Follow
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.models.models import Post, User, Follow
from app.utils.database import get_session
from app.utils.jwt import get_current_user
from app.utils.feed_algorithm import calculate_post_score, get_personalized_feed, get_discovery_feed, get_topic_feed
# from app.utils.redis_client import get_redis_client
# import json

router = APIRouter()

@router.get("/feed")
def get_personalized_feed_route(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)): #, redis_client = Depends(get_redis_client)):
    # cache_key = f"personalized_feed:{current_user.id}"
    # cached_feed = redis_client.get(cache_key)
    # if cached_feed:
    #     return json.loads(cached_feed)

    feed = get_personalized_feed(db, current_user)
    # redis_client.setex(cache_key, 60, json.dumps([p.dict() for p in feed])) # Cache for 60 seconds
    return feed

@router.get("/feed/discover")
def get_discovery_feed_route(db: Session = Depends(get_session)): #, redis_client = Depends(get_redis_client)):
    # cache_key = "discovery_feed"
    # cached_feed = redis_client.get(cache_key)
    # if cached_feed:
    #     return json.loads(cached_feed)

    feed = get_discovery_feed(db)
    # redis_client.setex(cache_key, 300, json.dumps([p.dict() for p in feed])) # Cache for 5 minutes
    return feed

@router.get("/feed/topic/{topic}")
def get_topic_feed_route(topic: str, db: Session = Depends(get_session)): #, redis_client = Depends(get_redis_client)):
    # cache_key = f"topic_feed:{topic}"
    # cached_feed = redis_client.get(cache_key)
    # if cached_feed:
    #     return json.loads(cached_feed)

    feed = get_topic_feed(db, topic)
    # redis_client.setex(cache_key, 300, json.dumps([p.dict() for p in feed])) # Cache for 5 minutes
    return feed
