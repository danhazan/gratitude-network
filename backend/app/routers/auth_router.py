from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError # Import IntegrityError

from app.models.models import User
from app.utils import jwt, security, email
from app.utils.database import engine

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class EmailVerification(BaseModel):
    token: str

# Dependency to get the database session
def get_session():
    from app.utils.database import engine
    with Session(engine) as session:
        yield session

@router.post("/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, session: Session = Depends(get_session)):
    try:
        db_user = session.exec(select(User).where(User.email == user.email)).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        db_user = session.exec(select(User).where(User.username == user.username)).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")

        hashed_password = security.hash_password(user.password)
        new_user = User(email=user.email, username=user.username, password_hash=hashed_password)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        # Send verification email
        verification_token = jwt.create_access_token(data={"sub": new_user.email})
        email.send_verification_email(new_user.email, verification_token)
        return {"message": "User created successfully. Please check your email for verification."}
    except IntegrityError:
        # This catches cases where a race condition might lead to duplicate email/username
        raise HTTPException(status_code=400, detail="Email or username already registered")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error during signup: {e}")

@router.post("/auth/login")
def login(form_data: UserLogin, session: Session = Depends(get_session)):
    if security.is_login_attempt_blocked(form_data.email):
        raise HTTPException(status_code=403, detail="Too many failed login attempts")

    user = session.exec(select(User).where(User.email == form_data.email)).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        security.record_failed_login_attempt(form_data.email)
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # Temporarily commented out for development to bypass email verification
    # if not user.email_verified:
    #     raise HTTPException(status_code=400, detail="Email not verified")

    access_token = jwt.create_access_token(data={"sub": user.email})
    refresh_token = jwt.create_refresh_token(data={"sub": user.email})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/auth/verify-email")
def verify_email(verification: EmailVerification, session: Session = Depends(get_session)):
    try:
        token_data = jwt.verify_token(verification.token, HTTPException(status_code=400, detail="Invalid token"))
        user = session.exec(select(User).where(User.email == token_data.email)).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        user.email_verified = True
        session.add(user)
        session.commit()
        return {"message": "Email verified successfully"}
    except HTTPException as e:
        raise e

@router.post("/auth/reset-password")
def reset_password_request(request: PasswordResetRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == request.email)).first()
    if user:
        password_reset_token = jwt.create_access_token(data={"sub": user.email})
        email.send_password_reset_email(user.email, password_reset_token)
    return {"message": "If a user with that email exists, a password reset link has been sent."}

@router.post("/auth/reset-password/confirm")
def reset_password_confirm(request: PasswordReset, session: Session = Depends(get_session)):
    try:
        token_data = jwt.verify_token(request.token, HTTPException(status_code=400, detail="Invalid token"))
        user = session.exec(select(User).where(User.email == token_data.email)).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        user.password_hash = security.hash_password(request.new_password)
        session.add(user)
        session.commit()
        return {"message": "Password has been reset successfully."}
    except HTTPException as e:
        raise e

@router.delete("/auth/delete")
def delete_account(session: Session = Depends(get_session), token: str = Depends(jwt.verify_token)):
    # This is a soft delete. A background job would be needed to purge the data.
    user = session.exec(select(User).where(User.email == token.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.deleted_at = datetime.now(timezone.utc)
    session.add(user)
    session.commit()
    return {"message": "Account scheduled for deletion."}

# Placeholder for OAuth endpoints
@router.post("/auth/oauth/google")
def oauth_google():
    return {"message": "OAuth with Google not yet implemented"}

@router.post("/auth/oauth/apple")
def oauth_apple():
    return {"message": "OAuth with Apple not yet implemented"}