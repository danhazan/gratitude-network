
from fastapi import HTTPException

NEGATIVE_KEYWORDS = ["complaint", "hate", "sad", "angry"]

def validate_post_content(content: str):
    for keyword in NEGATIVE_KEYWORDS:
        if keyword in content.lower():
            raise HTTPException(status_code=400, detail="Post contains negative content.")
