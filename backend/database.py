<<<<<<< HEAD
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variable or use default
DATABASE_URL = os.getenv(
    "DATABASE_URL"
)



# Create engine
engine = create_engine(DATABASE_URL)

# Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()
=======
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

URL_DATABASE = '' # format : mysql+pymysql://root:___(your-pw)__@localhost:3306/__(your-project-name)

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
>>>>>>> sathvik
