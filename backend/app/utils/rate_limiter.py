from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from collections import defaultdict
import time

# In-memory storage for demonstration. Use Redis or similar for production.
# {user_id: [(timestamp, count)]}
request_counts = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 5000, window: int = 3600): # 50 requests per hour
        super().__init__(app)
        self.limit = limit
        self.window = window

    async def dispatch(self, request: Request, call_next):
        # Only apply rate limiting to authenticated users and specific endpoints
        if request.url.path.startswith("/posts/") or request.url.path.startswith("/users/"):
            # This is a simplified way to get user ID. In a real app, you'd parse JWT.
            # For now, we'll assume the user ID is available in the request state after auth middleware
            user_id = request.state.user.id if hasattr(request.state, 'user') else "anonymous"

            current_time = time.time()
            # Clean up old requests outside the window
            request_counts[user_id] = [(t, c) for t, c in request_counts[user_id] if current_time - t < self.window]

            # Check if limit is exceeded
            if len(request_counts[user_id]) >= self.limit:
                raise HTTPException(status_code=429, detail="Too many requests")

            request_counts[user_id].append((current_time, 1))

        response = await call_next(request)
        return response
