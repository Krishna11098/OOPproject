# API Endpoints for Product Management
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
from database import SessionLocal
from routes.product_system import (
    ProductFactory, ProductService, 
    FertilizerCreate, PesticideCreate, SeedCreate, EquipmentCreate,
    ProductResponse, CartItemCreate, CartItemResponse
)

# Create router for product endpoints
product_router = APIRouter(prefix="/api/products", tags=["products"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Product CRUD endpoints

@product_router.get("/", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category: fertilizer, pesticide, seed, equipment"),
    search: Optional[str] = Query(None, description="Search in name, title, description"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all products with optional filters"""
    if search:
        products = ProductService.search_products(db, search)
    elif brand:
        products = ProductService.get_products_by_brand(db, brand)
    else:
        products = ProductService.get_all_products(db, category, skip, limit)
    
    return products

@product_router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = ProductService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@product_router.post("/fertilizers", response_model=ProductResponse)
async def create_fertilizer(fertilizer: FertilizerCreate, db: Session = Depends(get_db)):
    """Create a new fertilizer product"""
    return ProductFactory.create_fertilizer(db, fertilizer)

@product_router.post("/pesticides", response_model=ProductResponse)
async def create_pesticide(pesticide: PesticideCreate, db: Session = Depends(get_db)):
    """Create a new pesticide product"""
    return ProductFactory.create_pesticide(db, pesticide)

@product_router.post("/seeds", response_model=ProductResponse)
async def create_seed(seed: SeedCreate, db: Session = Depends(get_db)):
    """Create a new seed product"""
    return ProductFactory.create_seed(db, seed)

@product_router.post("/equipment", response_model=ProductResponse)
async def create_equipment(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    """Create a new equipment product"""
    return ProductFactory.create_equipment(db, equipment)

@product_router.put("/{product_id}/stock")
async def update_product_stock(
    product_id: int, 
    new_stock: int, 
    db: Session = Depends(get_db)
):
    """Update product stock quantity"""
    product = ProductService.update_stock(db, product_id, new_stock)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": f"Stock updated to {new_stock}", "product_id": product_id}

# Cart management endpoints

@product_router.post("/cart/add")
async def add_to_cart(
    cart_item: CartItemCreate,
    user_id: int,  # This should come from authentication
    db: Session = Depends(get_db)
):
    """Add item to user's cart"""
    # Check if product exists
    product = ProductService.get_product_by_id(db, cart_item.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == cart_item.product_id
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += cart_item.quantity
        db.commit()
        db.refresh(existing_item)
        return {"message": "Cart updated", "cart_item_id": existing_item.id}
    else:
        # Create new cart item
        new_cart_item = models.CartItem(
            user_id=user_id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity
        )
        db.add(new_cart_item)
        db.commit()
        db.refresh(new_cart_item)
        return {"message": "Item added to cart", "cart_item_id": new_cart_item.id}

@product_router.get("/cart/{user_id}", response_model=List[CartItemResponse])
async def get_user_cart(user_id: int, db: Session = Depends(get_db)):
    """Get user's cart items"""
    cart_items = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id
    ).all()
    return cart_items

@product_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: int, db: Session = Depends(get_db)):
    """Remove item from cart"""
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == cart_item_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

# Category-specific endpoints

@product_router.get("/categories/fertilizers", response_model=List[ProductResponse])
async def get_fertilizers(db: Session = Depends(get_db)):
    """Get all fertilizer products"""
    return db.query(models.Fertilizer).all()

@product_router.get("/categories/pesticides", response_model=List[ProductResponse])
async def get_pesticides(db: Session = Depends(get_db)):
    """Get all pesticide products"""
    return db.query(models.Pesticide).all()

@product_router.get("/categories/seeds", response_model=List[ProductResponse])
async def get_seeds(db: Session = Depends(get_db)):
    """Get all seed products"""
    return db.query(models.Seed).all()

@product_router.get("/categories/equipment", response_model=List[ProductResponse])
async def get_equipment(db: Session = Depends(get_db)):
    """Get all equipment products"""
    return db.query(models.Equipment).all()

# Statistics endpoints

@product_router.get("/stats/summary")
async def get_product_stats(db: Session = Depends(get_db)):
    """Get product statistics summary"""
    total_products = db.query(models.Product).count()
    fertilizer_count = db.query(models.Fertilizer).count()
    pesticide_count = db.query(models.Pesticide).count()
    seed_count = db.query(models.Seed).count()
    equipment_count = db.query(models.Equipment).count()
    
    return {
        "total_products": total_products,
        "by_category": {
            "fertilizers": fertilizer_count,
            "pesticides": pesticide_count,
            "seeds": seed_count,
            "equipment": equipment_count
        }
    }

@product_router.get("/brands")
async def get_all_brands(db: Session = Depends(get_db)):
    """Get list of all unique brands"""
    brands = db.query(models.Product.brand).distinct().all()
    return [brand[0] for brand in brands]