# create_admin_user.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal
import models
from auth import hash_password
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_admin_user():
    """Create the specific admin user"""
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_user = db.query(models.User).filter(
            (models.User.username == "admin") | 
            (models.User.email == "admin1009@gmail.com")
        ).first()
        
        if existing_user:
            print(f"User already exists with username '{existing_user.username}' or email '{existing_user.email}'")
            
            # Update existing user to admin if not already
            if not existing_user.is_admin:
                existing_user.is_admin = True
                db.commit()
                print(f"Updated user '{existing_user.username}' to admin status!")
            else:
                print(f"User '{existing_user.username}' is already an admin!")
            return
        
        # Hash the password
        hashed_password = hash_password("Pass123")
        
        # Create new admin user
        admin_user = models.User(
            username="admin",
            email="admin1009@gmail.com", 
            password=hashed_password,
            is_admin=True
        )
        
        # Add to database
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"Username: {admin_user.username}")
        print(f"Email: {admin_user.email}")
        print(f"Is Admin: {admin_user.is_admin}")
        print("\nYou can now login with these credentials and access the admin panel!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating admin user...")
    print("=" * 50)
    create_admin_user()
    print("=" * 50)