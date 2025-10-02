# auth.py
from passlib.context import CryptContext
from fastapi import HTTPException, Request, Depends
from sqlalchemy.orm import Session
from typing import Annotated
import models
from database import get_db
import hashlib

# Simple password context that doesn't have the bcrypt version issues
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _truncate_password(password: str) -> str:
    """Safely truncate password to 72 bytes for bcrypt"""
    # Convert to bytes
    password_bytes = password.encode('utf-8')
    
    # If longer than 72 bytes, truncate
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        # Decode back to string, ignoring any incomplete characters
        password = password_bytes.decode('utf-8', errors='ignore')
    
    return password

def hash_password(password: str) -> str:
    """Hash a password using passlib with bcrypt - safely handles long passwords"""
    # Truncate password to prevent bcrypt 72-byte limit issues
    safe_password = _truncate_password(password)
    
    try:
        return pwd_context.hash(safe_password)
    except Exception as e:
        print(f"Password hashing error: {e}")
        # If passlib fails, use a simple fallback
        import bcrypt
        password_bytes = safe_password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using passlib - safely handles long passwords"""
    # Truncate password to prevent bcrypt 72-byte limit issues
    safe_password = _truncate_password(plain_password)
    
    try:
        return pwd_context.verify(safe_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        # If passlib fails, try bcrypt directly
        try:
            import bcrypt
            password_bytes = safe_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception as e2:
            print(f"Fallback verification also failed: {e2}")
            return False

# Dependency to get current user from session
def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
