# migrate_add_admin_column.py
from sqlalchemy import create_engine, text
from database import engine
import os

def add_admin_column():
    """Add is_admin column to users table"""
    
    try:
        # Connect to database
        with engine.connect() as connection:
            # Check if column already exists
            result = connection.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            
            if 'is_admin' in columns:
                print("✅ is_admin column already exists!")
                return True
                
            # Add the is_admin column with default value False
            connection.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
            connection.commit()
            
            print("✅ Successfully added is_admin column to users table!")
            return True
            
    except Exception as e:
        print(f"❌ Error adding is_admin column: {e}")
        return False

if __name__ == "__main__":
    print("Adding is_admin column to users table...")
    print("=" * 50)
    success = add_admin_column()
    if success:
        print("Database migration completed successfully!")
        print("You can now run create_admin_user.py to create the admin user.")
    print("=" * 50)