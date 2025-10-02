# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(1000), nullable=False)

    blogs = relationship("Blog", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")



class Blog(Base):
    __tablename__ = 'blogs'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    likes = Column(Integer, default=0, nullable=False)
    dislikes = Column(Integer, default=0, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", back_populates="blogs")

    comments = relationship("Comment", back_populates="blog", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blog_id = Column(Integer, ForeignKey("blogs.id"), nullable=False)

    user = relationship("User", back_populates="comments")
    blog = relationship("Blog", back_populates="comments")

# Base Product class that will be inherited by specific product types
class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    brand = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # 'fertilizer', 'pesticide', 'seed', 'equipment'
    
    # Additional product fields
    image_url = Column(String(255))
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Polymorphic identity for inheritance
    product_type = Column(String(50))
    __mapper_args__ = {
        'polymorphic_identity': 'product',
        'polymorphic_on': product_type
    }

# Fertilizer-specific product class
class Fertilizer(Product):
    __tablename__ = 'fertilizers'
    
    id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    
    # Fertilizer-specific attributes
    npk_ratio = Column(String(20))  # e.g., "10-10-10"
    organic = Column(Boolean, default=False)
    fertilizer_type = Column(String(50))  # e.g., "liquid", "granular", "powder"
    coverage_area = Column(String(50))  # e.g., "500 sq ft"
    application_method = Column(String(100))  # e.g., "spray", "broadcast"
    nutrients = Column(Text)  # JSON string of nutrients
    suitable_crops = Column(Text)  # JSON string of suitable crops
    
    __mapper_args__ = {
        'polymorphic_identity': 'fertilizer',
    }

# Pesticide-specific product class
class Pesticide(Product):
    __tablename__ = 'pesticides'
    
    id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    
    # Pesticide-specific attributes
    active_ingredient = Column(String(100))
    pesticide_type = Column(String(50))  # e.g., "fungicide", "insecticide", "herbicide"
    toxicity_level = Column(String(20))  # e.g., "low", "medium", "high"
    application_rate = Column(String(50))  # e.g., "2ml per liter"
    target_pests = Column(Text)  # JSON string of target pests
    safety_period = Column(String(50))  # e.g., "7 days before harvest"
    dilution_ratio = Column(String(30))  # e.g., "1:500"
    
    __mapper_args__ = {
        'polymorphic_identity': 'pesticide',
    }

# Seed-specific product class
class Seed(Product):
    __tablename__ = 'seeds'
    
    id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    
    # Seed-specific attributes
    variety = Column(String(100))
    seed_type = Column(String(50))  # e.g., "hybrid", "open-pollinated", "heirloom"
    germination_rate = Column(Float)  # percentage
    maturity_days = Column(Integer)  # days to maturity
    planting_season = Column(String(50))  # e.g., "spring", "summer", "winter"
    spacing = Column(String(50))  # e.g., "6 inches apart"
    soil_type = Column(String(100))  # preferred soil type
    sunlight_requirement = Column(String(50))  # e.g., "full sun", "partial shade"
    water_requirement = Column(String(50))  # e.g., "moderate", "high", "low"
    
    __mapper_args__ = {
        'polymorphic_identity': 'seed',
    }

# Equipment-specific product class
class Equipment(Product):
    __tablename__ = 'equipments'
    
    id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    
    # Equipment-specific attributes
    equipment_type = Column(String(100))  # e.g., "irrigation", "harvesting", "planting"
    power_source = Column(String(50))  # e.g., "manual", "electric", "fuel"
    material = Column(String(100))  # e.g., "steel", "plastic", "aluminum"
    dimensions = Column(String(100))  # e.g., "120cm x 80cm x 50cm"
    weight = Column(String(30))  # e.g., "5.5 kg"
    warranty_period = Column(String(50))  # e.g., "2 years"
    power_consumption = Column(String(50))  # e.g., "100W" (for electric equipment)
    capacity = Column(String(50))  # e.g., "50 liters" (for tanks, sprayers)
    
    __mapper_args__ = {
        'polymorphic_identity': 'equipment',
    }

# Cart model for user shopping cart
class CartItem(Base):
    __tablename__ = 'cart_items'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, default=1)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    product = relationship("Product")

# Order model for purchase history
class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    total_amount = Column(Float, nullable=False)
    order_type = Column(String(50), default='cart')  # 'cart' or 'buynow'
    status = Column(String(50), default='pending')  # pending, confirmed, shipped, delivered, cancelled
    payment_status = Column(String(50), default='pending')  # pending, completed, failed
    shipping_address = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    order_date = Column(DateTime, default=datetime.utcnow)
    delivery_date = Column(DateTime)
    
    # Relationships
    user = relationship("User")
    order_items = relationship("OrderItem", back_populates="order")

# Order items for detailed order tracking
class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_unit = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product")

# Product reviews model
class ProductReview(Base):
    __tablename__ = 'product_reviews'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    rating = Column(Float, nullable=False)  # 1.0 to 5.0
    review_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    product = relationship("Product")

# User addresses model for saving multiple addresses
class UserAddress(Base):
    __tablename__ = 'user_addresses'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    landmark = Column(String(255))
    is_default = Column(Boolean, default=False)
    address_type = Column(String(50), default='home')  # home, office, other
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")




