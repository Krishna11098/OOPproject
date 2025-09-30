# auth.py
from passlib.context import CryptContext
from fastapi import HTTPException, Request, Depends
from sqlalchemy.orm import Session
from typing import Annotated
import models
from database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_LEN = 72
def hash_password(password: str) -> str:
    return pwd_context.hash(password[:MAX_LEN])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:MAX_LEN], hashed_password)

# Dependency to get current user from session
def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
