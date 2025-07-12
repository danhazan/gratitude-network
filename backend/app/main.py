from fastapi import FastAPI, Request, Depends
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
from .routers import auth_router, profiles_router, posts_router, interactions_router, social_router, feed_router, search_router
from .utils.database import create_db_and_tables
from .utils.rate_limiter import RateLimitMiddleware
from .utils.jwt import get_current_user
import logging # Import logging

# Configure logging
logging.basicConfig(level=logging.INFO) # Set logging level to INFO
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        create_db_and_tables()
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        # Depending on the severity, you might want to raise the exception
        # or handle it more gracefully, e.g., by exiting the application.
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Attempt to get the current user, but don't fail if not authenticated
        try:
            user = await get_current_user(request)
            request.state.user = user
        except Exception:
            request.state.user = None # Or handle anonymous users as needed
        response = await call_next(request)
        return response

app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitMiddleware, limit=50, window=3600)

app.include_router(auth_router.router)
app.include_router(profiles_router.router) # Included profiles_router
app.include_router(posts_router.router)
app.include_router(interactions_router.router)
app.include_router(social_router.router)
app.include_router(feed_router.router)
app.include_router(search_router.router)

@app.get("/healthz")
def healthz():
    return {"status": "ok"}