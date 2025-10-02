# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, Depends, Form, HTTPException, status, Path
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from typing import Annotated, List
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import os
from dotenv import load_dotenv
from auth import hash_password, verify_password
from pydantic import BaseModel


load_dotenv()

# Pydantic models for request bodies


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


# Import product routes
try:
    from routes.product_routes import product_router
    print("Product routes imported successfully")
except ImportError as e:
    print(f"Product routes not available: {e}")
    product_router = None

# Import new route modules
try:
    from routes.order_routes import router as order_router
    print("Order routes imported successfully")
except ImportError as e:
    print(f"Order routes not available: {e}")
    order_router = None

try:
    from routes.cart_routes import router as cart_router
    print("Cart routes imported successfully")
except ImportError as e:
    print(f"Cart routes not available: {e}")
    cart_router = None

app = FastAPI()

# Create all database tables (including new product tables)
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv('SESSION_SECRET', 'secretsuperstar-change-this')
)

# session middleware (keeps login in session cookie)

# CORS for React dev server at port 5173

# Get CORS origins from environment variable
cors_origins = os.getenv(
    'CORS_ORIGINS',
    'http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:3000'
).split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Use specific origins instead of wildcard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include product routes if available
if product_router:
    app.include_router(product_router)

# Include new route modules
if order_router:
    app.include_router(order_router)
if cart_router:
    app.include_router(cart_router)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]

# Helper function to get current user


def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@app.post("/register")
async def register(db: Session = Depends(get_db), request: Request = None, username: str = Form(...), password: str = Form(...), email: str = Form(...)):
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
async def login(db: Session = Depends(get_db), request: Request = None, username: str = Form(...), password: str = Form(...)):
    user = db.query(models.User).filter(
        models.User.username == username).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    request.session["user_id"] = user.id
    return {"id": user.id, "username": user.username, "email": user.email}


@app.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}


@app.get("/me")
async def read_me(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    print(user_id)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return {"id": user.id, "username": user.username, "email": user.email}


# ---------- Blog endpoints ----------

@app.post("/blogs")
async def create_blog(payload: BlogCreate, request: Request, db: db_dependency):
    user_id = request.session.get("user_id")
    print(request.session.get("user_id"))
    print(user_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    blog = models.Blog(title=payload.title, content=payload.content,
                       user_id=user_id, likes=0, dislikes=0)
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
                {"id": c.id, "text": c.text, "created_at": c.created_at,
                    "user": {"id": c.user.id, "username": c.user.username}}
                for c in blog.comments
            ]
        })
    return result


@app.put("/blogs/{blog_id}")
async def update_blog(db: db_dependency, blog_id: int = Path(...), payload: BlogUpdate = None, request: Request = None):
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
        raise HTTPException(
            status_code=401, detail="Login required to dislike")

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

    comment = models.Comment(content=payload.text,
                             user_id=user_id, blog_id=blog_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "text": comment.content,
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
            "text": c.content,
            "created_at": c.created_at,
            "user": {"id": c.user.id, "username": c.user.username}
        } for c in blog.comments
    ]
# Product endpoints accessible without authentication (for marketplace browsing)


@app.get("/products")
async def get_products(
    db: Session = Depends(get_db),
    category: str = None,
    search: str = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all products with optional filters"""
    query = db.query(models.Product).filter(models.Product.is_active == True)

    if category:
        query = query.filter(models.Product.category == category)

    if search:
        query = query.filter(
            models.Product.name.contains(search) |
            models.Product.title.contains(search) |
            models.Product.description.contains(search)
        )

    products = query.offset(skip).limit(limit).all()

    return {
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "brand": p.brand,
                "title": p.title,
                "description": p.description,
                "category": p.category,
                "product_type": p.product_type,
                "image_url": p.image_url,
                "stock_quantity": p.stock_quantity,
                "rating": p.rating,
                "review_count": p.review_count
            } for p in products
        ],
        "total": len(products)
    }


@app.get("/products/{product_id}")
async def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    """Get detailed product information"""
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Base product data
    product_data = {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "brand": product.brand,
        "title": product.title,
        "description": product.description,
        "category": product.category,
        "product_type": product.product_type,
        "image_url": product.image_url,
        "stock_quantity": product.stock_quantity,
        "rating": product.rating,
        "review_count": product.review_count,
        "created_at": product.created_at
    }

    # Add specific attributes based on product type
    if product.product_type == "fertilizer":
        fertilizer = db.query(models.Fertilizer).filter(
            models.Fertilizer.id == product_id).first()
        if fertilizer:
            product_data.update({
                "npk_ratio": fertilizer.npk_ratio,
                "organic": fertilizer.organic,
                "fertilizer_type": fertilizer.fertilizer_type,
                "coverage_area": fertilizer.coverage_area,
                "application_method": fertilizer.application_method,
                "nutrients": fertilizer.nutrients,
                "suitable_crops": fertilizer.suitable_crops
            })

    elif product.product_type == "pesticide":
        pesticide = db.query(models.Pesticide).filter(
            models.Pesticide.id == product_id).first()
        if pesticide:
            product_data.update({
                "active_ingredient": pesticide.active_ingredient,
                "pesticide_type": pesticide.pesticide_type,
                "toxicity_level": pesticide.toxicity_level,
                "application_rate": pesticide.application_rate,
                "target_pests": pesticide.target_pests,
                "safety_period": pesticide.safety_period,
                "dilution_ratio": pesticide.dilution_ratio
            })

    elif product.product_type == "seed":
        seed = db.query(models.Seed).filter(
            models.Seed.id == product_id).first()
        if seed:
            product_data.update({
                "variety": seed.variety,
                "seed_type": seed.seed_type,
                "germination_rate": seed.germination_rate,
                "maturity_days": seed.maturity_days,
                "planting_season": seed.planting_season,
                "spacing": seed.spacing,
                "soil_type": seed.soil_type,
                "sunlight_requirement": seed.sunlight_requirement,
                "water_requirement": seed.water_requirement
            })

    elif product.product_type == "equipment":
        equipment = db.query(models.Equipment).filter(
            models.Equipment.id == product_id).first()
        if equipment:
            product_data.update({
                "equipment_type": equipment.equipment_type,
                "power_source": equipment.power_source,
                "material": equipment.material,
                "dimensions": equipment.dimensions,
                "weight": equipment.weight,
                "warranty_period": equipment.warranty_period,
                "power_consumption": equipment.power_consumption,
                "capacity": equipment.capacity
            })

    return product_data


@app.get("/announcements")
async def get_announcements(db: Session = Depends(get_db)):
    announcements = db.query(models.Announcement).all()
    return announcements
