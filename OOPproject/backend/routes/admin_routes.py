# admin_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from datetime import datetime, date
import models
from database import get_db
from auth import get_admin_user

admin_router = APIRouter(prefix="/api/admin", tags=["admin"])

# Pydantic models for Announcements
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    post_date: str  # Use string to accept date in 'YYYY-MM-DD' format

class AnnouncementUpdate(AnnouncementCreate):
    pass

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    post_date: date
    
    class Config:
        from_attributes = True

# Announcement CRUD Routes
@admin_router.post("/announcements", response_model=AnnouncementResponse)
async def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Create a new announcement (Admin only)"""
    try:
        # Parse the date string
        post_date = datetime.strptime(announcement.post_date, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail="Invalid date format. Use YYYY-MM-DD format."
        )
    
    db_announcement = models.Announcement(
        title=announcement.title,
        content=announcement.content,
        post_date=post_date,
        user_id=admin_user.id
    )
    
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    
    return db_announcement

@admin_router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: int,
    announcement: AnnouncementUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Update an existing announcement (Admin only)"""
    db_announcement = db.query(models.Announcement).filter(
        models.Announcement.id == announcement_id
    ).first()
    
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    try:
        # Parse the date string
        post_date = datetime.strptime(announcement.post_date, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail="Invalid date format. Use YYYY-MM-DD format."
        )
    
    db_announcement.title = announcement.title
    db_announcement.content = announcement.content
    db_announcement.post_date = post_date
    
    db.commit()
    db.refresh(db_announcement)
    
    return db_announcement

@admin_router.delete("/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Delete an announcement (Admin only)"""
    db_announcement = db.query(models.Announcement).filter(
        models.Announcement.id == announcement_id
    ).first()
    
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    db.delete(db_announcement)
    db.commit()
    
    return {"message": "Announcement deleted successfully"}

# User Statistics Route
@admin_router.get("/stats/users")
async def get_user_stats(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Get total number of registered users (Admin only)"""
    total_users = db.query(func.count(models.User.id)).scalar()
    banned_users = db.query(func.count(models.User.id)).filter(models.User.is_banned == True).scalar()
    active_users = total_users - banned_users
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "banned_users": banned_users
    }

# User Management Routes
@admin_router.get("/users")
async def get_all_users(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_admin_user),
    skip: int = 0,
    limit: int = 50
):
    """Get all users with pagination (Admin only)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    
    users_data = []
    for user in users:
        users_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin,
            "is_banned": user.is_banned,
            "banned_at": user.banned_at,
            "ban_reason": user.ban_reason
        })
    
    return users_data

@admin_router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: int,
    ban_reason: str = Form(default="No reason provided"),
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Ban a user (Admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot ban admin users")
    
    if user.is_banned:
        raise HTTPException(status_code=400, detail="User is already banned")
    
    user.is_banned = True
    user.banned_at = datetime.now()
    user.ban_reason = ban_reason
    
    db.commit()
    db.refresh(user)
    
    return {"message": f"User {user.username} has been banned successfully"}

@admin_router.post("/users/{user_id}/unban")
async def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Unban a user (Admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_banned:
        raise HTTPException(status_code=400, detail="User is not banned")
    
    user.is_banned = False
    user.banned_at = None
    user.ban_reason = None
    
    db.commit()
    db.refresh(user)
    
    return {"message": f"User {user.username} has been unbanned successfully"}