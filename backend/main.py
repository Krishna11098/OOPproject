# main.py
from fastapi import FastAPI, Request, Depends, Form, HTTPException, Path
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from typing import Annotated, List
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from auth import hash_password, verify_password  # you already have these
from pydantic import BaseModel

# create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# session middleware (keeps login in session cookie)
app.add_middleware(
    SessionMiddleware,
    secret_key="secretsuperstar",
    # same_site="none",    # allow cross-site
    # https_only=False     # set True if using HTTPS
)

# CORS for React dev server at port 5173
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173","http://localhost:5173"],
    # allow_origins=["http://127.0.0.1:5173","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# ---------- Pydantic schemas for requests/responses ----------
class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

class BlogCreate(BaseModel):
    title: str
    content: str

class BlogUpdate(BaseModel):
    title: str
    content: str

class CommentCreate(BaseModel):
    text: str

# ---------- Auth endpoints (you had these earlier) ----------
@app.post("/register")
async def register(db: db_dependency, request: Request, username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    if db.query(models.User).filter(models.User.username == username).first():
        raise HTTPException(status_code=400, detail="User already exists")
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = hash_password(password)
    user = models.User(username=username, password=hashed_pw, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id
    return {"id": user.id, "username": user.username, "email": user.email}


@app.post("/login")
async def login(db: db_dependency, request: Request, username: str = Form(...), password: str = Form(...)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    request.session["user_id"] = user.id
    return {"id": user.id, "username": user.username, "email": user.email}


@app.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}


@app.get("/me")
async def read_me(request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "Not authenticated"}
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return {"id": user.id, "username": user.username, "email": user.email}


# ---------- Blog endpoints ----------

@app.post("/blogs")
async def create_blog(payload: BlogCreate, request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    blog = models.Blog(title=payload.title, content=payload.content, user_id=user_id, likes=0, dislikes=0)
    db.add(blog)
    db.commit()
    db.refresh(blog)

    return {
        "id": blog.id,
        "title": blog.title,
        "content": blog.content,
        "likes": blog.likes,
        "dislikes": blog.dislikes,
        "created_at": blog.created_at,
        "author": {"id": blog.author.id, "username": blog.author.username},
        "comments": []
    }


@app.get("/blogs")
async def list_blogs(db: db_dependency):
    blogs = db.query(models.Blog).order_by(models.Blog.created_at.desc()).all()
    result = []
    for blog in blogs:
        result.append({
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "likes": blog.likes,
            "dislikes": blog.dislikes,
            "created_at": blog.created_at,
            "author": {"id": blog.author.id, "username": blog.author.username},
            "comments": [
                {"id": c.id, "text": c.text, "created_at": c.created_at, "user": {"id": c.user.id, "username": c.user.username}}
                for c in blog.comments
            ]
        })
    return result


@app.put("/blogs/{blog_id}")
async def update_blog( db: db_dependency,blog_id: int = Path(...), payload: BlogUpdate = None, request: Request = None):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    blog.title = payload.title
    blog.content = payload.content
    db.commit()
    db.refresh(blog)
    return {"message": "Blog updated", "id": blog.id}


@app.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: int, request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(blog)
    db.commit()
    return {"message": "Blog deleted"}


# ---------- Likes / Dislikes ----------
@app.post("/blogs/{blog_id}/like")
async def like_blog(blog_id: int, request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    if not user_id:
        # If you want anyone (not logged in) to be able to like, remove this check.
        raise HTTPException(status_code=401, detail="Login required to like")

    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    blog.likes = (blog.likes or 0) + 1
    db.commit()
    db.refresh(blog)
    return {"message": "Liked", "likes": blog.likes, "dislikes": blog.dislikes}


@app.post("/blogs/{blog_id}/dislike")
async def dislike_blog(blog_id: int, request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required to dislike")

    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    blog.dislikes = (blog.dislikes or 0) + 1
    db.commit()
    db.refresh(blog)
    return {"message": "Disliked", "likes": blog.likes, "dislikes": blog.dislikes}


# ---------- Comments ----------
@app.post("/blogs/{blog_id}/comment")
async def add_comment(blog_id: int, payload: CommentCreate, request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")

    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    comment = models.Comment(text=payload.text, user_id=user_id, blog_id=blog_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "text": comment.text,
        "created_at": comment.created_at,
        "user": {"id": comment.user.id, "username": comment.user.username}
    }


@app.get("/blogs/{blog_id}/comments")
async def get_comments(blog_id: int, db: db_dependency):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return [
        {
            "id": c.id,
            "text": c.text,
            "created_at": c.created_at,
            "user": {"id": c.user.id, "username": c.user.username}
        } for c in blog.comments
    ]
