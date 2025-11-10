# Product Schema Demonstration and API Endpoints
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import models
from database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Pydantic models for API requests/responses

class ProductBase(BaseModel):
    name: str
    price: float
    brand: str
    title: str
    description: str
    image_url: Optional[str] = None
    stock_quantity: int = 0

class FertilizerCreate(ProductBase):
    npk_ratio: Optional[str] = None
    organic: bool = False
    fertilizer_type: Optional[str] = None
    coverage_area: Optional[str] = None
    application_method: Optional[str] = None
    nutrients: Optional[str] = None
    suitable_crops: Optional[str] = None

class PesticideCreate(ProductBase):
    active_ingredient: Optional[str] = None
    pesticide_type: Optional[str] = None
    toxicity_level: Optional[str] = None
    application_rate: Optional[str] = None
    target_pests: Optional[str] = None
    safety_period: Optional[str] = None
    dilution_ratio: Optional[str] = None

class SeedCreate(ProductBase):
    variety: Optional[str] = None
    seed_type: Optional[str] = None
    germination_rate: Optional[float] = None
    maturity_days: Optional[int] = None
    planting_season: Optional[str] = None
    spacing: Optional[str] = None
    soil_type: Optional[str] = None
    sunlight_requirement: Optional[str] = None
    water_requirement: Optional[str] = None

class EquipmentCreate(ProductBase):
    equipment_type: Optional[str] = None
    power_source: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    warranty_period: Optional[str] = None
    power_consumption: Optional[str] = None
    capacity: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    brand: str
    title: str
    description: str
    category: str
    product_type: str
    stock_quantity: int
    rating: float
    review_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse
    
    class Config:
        from_attributes = True

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Product factory class demonstrating OOP principles
class ProductFactory:
    """Factory class to create different types of products"""
    
    @staticmethod
    def create_fertilizer(db: Session, fertilizer_data: FertilizerCreate) -> models.Fertilizer:
        """Create a fertilizer product"""
        fertilizer = models.Fertilizer(
            name=fertilizer_data.name,
            price=fertilizer_data.price,
            brand=fertilizer_data.brand,
            title=fertilizer_data.title,
            description=fertilizer_data.description,
            category="fertilizer",
            image_url=fertilizer_data.image_url,
            stock_quantity=fertilizer_data.stock_quantity,
            npk_ratio=fertilizer_data.npk_ratio,
            organic=fertilizer_data.organic,
            fertilizer_type=fertilizer_data.fertilizer_type,
            coverage_area=fertilizer_data.coverage_area,
            application_method=fertilizer_data.application_method,
            nutrients=fertilizer_data.nutrients,
            suitable_crops=fertilizer_data.suitable_crops
        )
        db.add(fertilizer)
        db.commit()
        db.refresh(fertilizer)
        return fertilizer
    
    @staticmethod
    def create_pesticide(db: Session, pesticide_data: PesticideCreate) -> models.Pesticide:
        """Create a pesticide product"""
        pesticide = models.Pesticide(
            name=pesticide_data.name,
            price=pesticide_data.price,
            brand=pesticide_data.brand,
            title=pesticide_data.title,
            description=pesticide_data.description,
            category="pesticide",
            image_url=pesticide_data.image_url,
            stock_quantity=pesticide_data.stock_quantity,
            active_ingredient=pesticide_data.active_ingredient,
            pesticide_type=pesticide_data.pesticide_type,
            toxicity_level=pesticide_data.toxicity_level,
            application_rate=pesticide_data.application_rate,
            target_pests=pesticide_data.target_pests,
            safety_period=pesticide_data.safety_period,
            dilution_ratio=pesticide_data.dilution_ratio
        )
        db.add(pesticide)
        db.commit()
        db.refresh(pesticide)
        return pesticide
    
    @staticmethod
    def create_seed(db: Session, seed_data: SeedCreate) -> models.Seed:
        """Create a seed product"""
        seed = models.Seed(
            name=seed_data.name,
            price=seed_data.price,
            brand=seed_data.brand,
            title=seed_data.title,
            description=seed_data.description,
            category="seed",
            image_url=seed_data.image_url,
            stock_quantity=seed_data.stock_quantity,
            variety=seed_data.variety,
            seed_type=seed_data.seed_type,
            germination_rate=seed_data.germination_rate,
            maturity_days=seed_data.maturity_days,
            planting_season=seed_data.planting_season,
            spacing=seed_data.spacing,
            soil_type=seed_data.soil_type,
            sunlight_requirement=seed_data.sunlight_requirement,
            water_requirement=seed_data.water_requirement
        )
        db.add(seed)
        db.commit()
        db.refresh(seed)
        return seed
    
    @staticmethod
    def create_equipment(db: Session, equipment_data: EquipmentCreate) -> models.Equipment:
        """Create an equipment product"""
        equipment = models.Equipment(
            name=equipment_data.name,
            price=equipment_data.price,
            brand=equipment_data.brand,
            title=equipment_data.title,
            description=equipment_data.description,
            category="equipment",
            image_url=equipment_data.image_url,
            stock_quantity=equipment_data.stock_quantity,
            equipment_type=equipment_data.equipment_type,
            power_source=equipment_data.power_source,
            material=equipment_data.material,
            dimensions=equipment_data.dimensions,
            weight=equipment_data.weight,
            warranty_period=equipment_data.warranty_period,
            power_consumption=equipment_data.power_consumption,
            capacity=equipment_data.capacity
        )
        db.add(equipment)
        db.commit()
        db.refresh(equipment)
        return equipment

# Product service class demonstrating polymorphism
class ProductService:
    """Service class for product operations"""
    
    @staticmethod
    def get_all_products(db: Session, category: Optional[str] = None, skip: int = 0, limit: int = 100):
        """Get all products with optional category filter"""
        query = db.query(models.Product)
        if category:
            query = query.filter(models.Product.category == category)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int):
        """Get a specific product by ID"""
        return db.query(models.Product).filter(models.Product.id == product_id).first()
    
    @staticmethod
    def search_products(db: Session, search_term: str):
        """Search products by name, title, or description"""
        return db.query(models.Product).filter(
            models.Product.name.contains(search_term) |
            models.Product.title.contains(search_term) |
            models.Product.description.contains(search_term)
        ).all()
    
    @staticmethod
    def get_products_by_brand(db: Session, brand: str):
        """Get all products from a specific brand"""
        return db.query(models.Product).filter(models.Product.brand == brand).all()
    
    @staticmethod
    def update_stock(db: Session, product_id: int, new_stock: int):
        """Update product stock quantity"""
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if product:
            product.stock_quantity = new_stock
            db.commit()
            db.refresh(product)
        return product

# Sample data creation function
def create_sample_products(db: Session):
    """Create sample products for testing"""
    
    # Sample Fertilizer
    fertilizer_data = FertilizerCreate(
        name="NPK Organic Fertilizer",
        price=299.99,
        brand="GreenGrow",
        title="Premium Organic NPK Fertilizer for All Plants",
        description="High-quality organic fertilizer with balanced NPK ratio for healthy plant growth",
        stock_quantity=50,
        npk_ratio="10-10-10",
        organic=True,
        fertilizer_type="granular",
        coverage_area="500 sq ft",
        application_method="broadcast and water",
        nutrients='{"nitrogen": 10, "phosphorus": 10, "potassium": 10}',
        suitable_crops='["vegetables", "fruits", "flowers"]'
    )
    
    # Sample Pesticide
    pesticide_data = PesticideCreate(
        name="Broad Spectrum Fungicide",
        price=189.50,
        brand="CropProtect",
        title="Advanced Fungicide for Plant Disease Control",
        description="Effective fungicide for controlling various plant diseases",
        stock_quantity=30,
        active_ingredient="Propiconazole",
        pesticide_type="fungicide",
        toxicity_level="low",
        application_rate="2ml per liter",
        target_pests='["powdery mildew", "rust", "leaf spot"]',
        safety_period="7 days before harvest",
        dilution_ratio="1:500"
    )
    
    # Sample Seed
    seed_data = SeedCreate(
        name="Hybrid Tomato Seeds",
        price=49.99,
        brand="SeedMaster",
        title="High-Yield Hybrid Tomato Seeds - Premium Quality",
        description="Disease-resistant hybrid tomato seeds with excellent yield",
        stock_quantity=100,
        variety="Cherry Tomato Hybrid",
        seed_type="hybrid",
        germination_rate=95.0,
        maturity_days=75,
        planting_season="spring-summer",
        spacing="18 inches apart",
        soil_type="well-drained loamy soil",
        sunlight_requirement="full sun",
        water_requirement="moderate"
    )
    
    # Sample Equipment
    equipment_data = EquipmentCreate(
        name="Garden Sprayer",
        price=799.00,
        brand="AgroTools",
        title="Professional Battery-Powered Garden Sprayer",
        description="High-capacity battery-powered sprayer for efficient garden maintenance",
        stock_quantity=15,
        equipment_type="spraying",
        power_source="rechargeable battery",
        material="high-grade plastic",
        dimensions="45cm x 25cm x 60cm",
        weight="3.5 kg",
        warranty_period="2 years",
        power_consumption="12V battery",
        capacity="20 liters"
    )
    
    # Create products using factory
    try:
        ProductFactory.create_fertilizer(db, fertilizer_data)
        ProductFactory.create_pesticide(db, pesticide_data)
        ProductFactory.create_seed(db, seed_data)
        ProductFactory.create_equipment(db, equipment_data)
        print("Sample products created successfully!")
    except Exception as e:
        print(f"Error creating sample products: {e}")

if __name__ == "__main__":
    # Test the OOP inheritance
    print("🌱 Agriculture Product Management System")
    print("="*50)
    
    # Create database session
    db = SessionLocal()
    
    # Create sample products
    print("Creating sample products...")
    create_sample_products(db)
    
    # Demonstrate polymorphism
    print("\nDemonstrating OOP Inheritance and Polymorphism:")
    print("-"*50)
    
    # Get all products (polymorphic query)
    all_products = ProductService.get_all_products(db)
    
    for product in all_products:
        print(f"\nProduct Type: {product.product_type}")
        print(f"Name: {product.name}")
        print(f"Brand: {product.brand}")
        print(f"Price: ₹{product.price}")
        print(f"Category: {product.category}")
        
        # Demonstrate specific attributes based on type
        if isinstance(product, models.Fertilizer):
            print(f"NPK Ratio: {product.npk_ratio}")
            print(f"Organic: {product.organic}")
        elif isinstance(product, models.Pesticide):
            print(f"Active Ingredient: {product.active_ingredient}")
            print(f"Toxicity Level: {product.toxicity_level}")
        elif isinstance(product, models.Seed):
            print(f"Variety: {product.variety}")
            print(f"Germination Rate: {product.germination_rate}%")
        elif isinstance(product, models.Equipment):
            print(f"Equipment Type: {product.equipment_type}")
            print(f"Power Source: {product.power_source}")
    
    # Search functionality
    print(f"\n\nSearch Results for 'tomato':")
    print("-"*30)
    search_results = ProductService.search_products(db, "tomato")
    for product in search_results:
        print(f"- {product.name} (₹{product.price})")
    
    # Category filtering
    print(f"\n\nFertilizer Products:")
    print("-"*20)
    fertilizers = ProductService.get_all_products(db, category="fertilizer")
    for fert in fertilizers:
        print(f"- {fert.name} - NPK: {fert.npk_ratio}")
    
    db.close()
    print("\n✅ OOP Product System Demo Complete!")