#!/usr/bin/env python3
"""
Database migration script to add ban functionality to User model
"""

import sqlite3
from datetime import datetime

def migrate_database():
    """Add ban-related columns to existing User table"""
    
    # Connect to database
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()

    try:
        print('Adding ban functionality columns to users table...')
        
        # Add is_banned column
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0;')
            print('Added is_banned column')
        except sqlite3.OperationalError as e:
            print(f'is_banned column may already exist: {e}')
        
        # Add banned_at column
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN banned_at DATETIME;')
            print('Added banned_at column')
        except sqlite3.OperationalError as e:
            print(f'banned_at column may already exist: {e}')
        
        # Add ban_reason column
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN ban_reason VARCHAR(500);')
            print('Added ban_reason column')
        except sqlite3.OperationalError as e:
            print(f'ban_reason column may already exist: {e}')
        
        conn.commit()
        print('Database migration completed successfully!')
        
        # Verify the schema
        cursor.execute('PRAGMA table_info(users);')
        columns = cursor.fetchall()
        print('Updated users table schema:')
        for col in columns:
            print(f'  {col[1]} ({col[2]})')
            
    except Exception as e:
        print(f'Error during migration: {e}')
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()