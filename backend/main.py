from fastapi import FastAPI, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from typing import Annotated
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from auth import hash_password, verify_password 

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

app.add_middleware(SessionMiddleware, secret_key="secretsuperstar")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/register")
async def register(db:db_dependency, request: Request, username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    if db.query(models.User).filter(models.User.username == username).first():
        raise HTTPException(status_code=400, detail="User already exists")
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_pw = hash_password(password)  # hash here
    user = models.User(username=username, password=hashed_pw, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id
    return {"id": user.id, "username": user.username, "email": user.email}
    

@app.post("/login")
async def login(db:db_dependency, request: Request, username: str = Form(...), password: str = Form(...)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.password):   # verify hash here
        raise HTTPException(status_code=400, detail="Invalid credentials")
    request.session["user_id"] = user.id
    return {"id": user.id, "username": user.username, "email": user.email}

@app.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

# example of a protected route
@app.get("/me")
async def read_me(request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "Not authenticated"}
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return {"id": user.id, "username": user.username, "email": user.email}