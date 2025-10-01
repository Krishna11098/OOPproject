from fastapi import FastAPI, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from typing import Annotated
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import os
from dotenv import load_dotenv
from auth import hash_password, verify_password 
from pydantic import BaseModel


load_dotenv()

# Pydantic models for request bodies

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

app = FastAPI(
    title="Agriculture Product Management API",
    description="API for managing agricultural products with OOP inheritance",
    version="1.0.0"
)

# Create all database tables (including new product tables)
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv('SESSION_SECRET', 'secretsuperstar-change-this')
)

from fastapi.middleware.cors import CORSMiddleware

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
    
    hashed_pw = hash_password(password)  # hash here
    user = models.User(username=username, password=hashed_pw, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id
    return {"id": user.id, "username": user.username, "email": user.email}
    

@app.post("/login")
async def login(db: Session = Depends(get_db), request: Request = None, username: str = Form(...), password: str = Form(...)):
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
async def read_me(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "Not authenticated"}
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return {"id": user.id, "username": user.username, "email": user.email}

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
        fertilizer = db.query(models.Fertilizer).filter(models.Fertilizer.id == product_id).first()
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
        pesticide = db.query(models.Pesticide).filter(models.Pesticide.id == product_id).first()
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
        seed = db.query(models.Seed).filter(models.Seed.id == product_id).first()
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
        equipment = db.query(models.Equipment).filter(models.Equipment.id == product_id).first()
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