
from fastapi import Request, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from . import jwt
from app.models.models import User
from ..routers.auth_router import get_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = jwt.verify_token(token, credentials_exception)
    user = session.exec(select(User).where(User.email == token_data.email)).first()
    if user is None:
        raise credentials_exception
    return user
