from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.suqaba_client import SuqabaClient

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(db_user.id),
            "email": db_user.email,
            "name": db_user.name
        }
    }

@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update job counts from Suqaba
    try:
        if user.suqaba_token:
            suqaba_client = SuqabaClient(user.suqaba_token)
            job_counts = await suqaba_client.get_job_counts()
            user.completed_jobs = job_counts.get("completed", 0)
            user.processing_jobs = job_counts.get("processing", 0)
            user.queued_jobs = job_counts.get("queued", 0)
            db.commit()
    except Exception as e:
        print(f"Failed to update job counts: {e}")
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "jobCounts": {
                "completed": user.completed_jobs,
                "processing": user.processing_jobs,
                "queued": user.queued_jobs,
            }
        }
    }

@router.post("/suqaba-token")
async def store_suqaba_token(
    token_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Store Suqaba authentication token"""
    current_user.suqaba_token = token_data.get("token")
    db.commit()
    
    # Verify token and get initial job counts
    try:
        suqaba_client = SuqabaClient(current_user.suqaba_token)
        job_counts = await suqaba_client.get_job_counts()
        current_user.completed_jobs = job_counts.get("completed", 0)
        current_user.processing_jobs = job_counts.get("processing", 0)
        current_user.queued_jobs = job_counts.get("queued", 0)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Suqaba token: {str(e)}"
        )
    
    return {"message": "Suqaba token stored successfully"}