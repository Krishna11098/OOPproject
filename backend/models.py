from sqlalchemy import Boolean, Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True) 
    username = Column(String(50), unique = True)
    email = Column(String(50), unique=True, index=True)
    password = Column(String(1000))
