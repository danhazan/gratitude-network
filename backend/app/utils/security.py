
import bcrypt
from collections import defaultdict
import time

LOGIN_ATTEMPTS = defaultdict(lambda: {"count": 0, "timestamp": 0})
LOGIN_ATTEMPT_LIMIT = 5
LOGIN_ATTEMPT_TIMEOUT = 60 * 5  # 5 minutes

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def is_login_attempt_blocked(email: str) -> bool:
    attempt = LOGIN_ATTEMPTS[email]
    if attempt["count"] >= LOGIN_ATTEMPT_LIMIT:
        if time.time() - attempt["timestamp"] < LOGIN_ATTEMPT_TIMEOUT:
            return True
        else:
            # Reset after timeout
            LOGIN_ATTEMPTS.pop(email)
    return False

def record_failed_login_attempt(email: str):
    LOGIN_ATTEMPTS[email]["count"] += 1
    LOGIN_ATTEMPTS[email]["timestamp"] = time.time()
