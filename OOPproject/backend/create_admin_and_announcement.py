#!/usr/bin/env python3
"""
Create admin user and sample announcement
"""

from database import SessionLocal
from models import User, Announcement
from auth import hash_password
from datetime import date

def create_admin_and_announcement():
    db = SessionLocal()
    
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.is_admin == True).first()
        if not admin:
            # Create an admin user
            admin = User(
                username='admin',
                email='admin@example.com',
                password=hash_password('admin123'),
                is_admin=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print('Admin user created: admin/admin123')
        else:
            print(f'Admin user exists: {admin.username}')

        # Check if there are any announcements
        announcements = db.query(Announcement).all()
        print(f'Existing announcements: {len(announcements)}')

        if len(announcements) == 0:
            # Create a sample announcement
            sample_announcement = Announcement(
                title='Welcome to AgriMarket!',
                content='Welcome to our new agriculture product marketplace. Here you can find high-quality fertilizers, pesticides, seeds, and equipment for all your farming needs.',
                post_date=date.today(),
                user_id=admin.id
            )
            db.add(sample_announcement)
            db.commit()
            print('Sample announcement created')
        else:
            print('Announcements already exist')

    except Exception as e:
        print(f'Error: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_and_announcement()