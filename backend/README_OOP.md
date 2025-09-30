# 🌱 Agriculture Product Management System - OOP Implementation

## Overview

This project implements a comprehensive **Object-Oriented Programming (OOP)** system for managing agriculture products using **SQLAlchemy** with **inheritance patterns**. The system demonstrates polymorphism, inheritance, and encapsulation principles through a real-world agriculture marketplace application.

## 🏗️ OOP Architecture

### Base Product Class
```python
class Product(Base):
    # Common attributes for all products
    - id, name, price, brand, title, description
    - category, image_url, stock_quantity
    - rating, review_count, timestamps
```

### Inherited Classes

#### 1. 🧪 Fertilizer Class
```python
class Fertilizer(Product):
    # Specific to fertilizers
    - npk_ratio (e.g., "10-10-10")
    - organic (Boolean)
    - fertilizer_type (liquid/granular/powder)
    - coverage_area
    - application_method
    - nutrients (JSON)
    - suitable_crops (JSON)
```

#### 2. 🦠 Pesticide Class
```python
class Pesticide(Product):
    # Specific to pesticides
    - active_ingredient
    - pesticide_type (fungicide/insecticide/herbicide)
    - toxicity_level
    - application_rate
    - target_pests (JSON)
    - safety_period
    - dilution_ratio
```

#### 3. 🌱 Seed Class
```python
class Seed(Product):
    # Specific to seeds
    - variety
    - seed_type (hybrid/open-pollinated/heirloom)
    - germination_rate (percentage)
    - maturity_days
    - planting_season
    - spacing, soil_type
    - sunlight_requirement
    - water_requirement
```

#### 4. 🔧 Equipment Class
```python
class Equipment(Product):
    # Specific to equipment
    - equipment_type
    - power_source
    - material, dimensions, weight
    - warranty_period
    - power_consumption
    - capacity
```

## 🔧 Key OOP Features Implemented

### 1. **Inheritance**
- All product classes inherit from the base `Product` class
- Common attributes and methods are defined once in the parent class
- Specific attributes are added in child classes

### 2. **Polymorphism**
- Single query can retrieve all product types: `db.query(Product).all()`
- Type-specific behavior through `isinstance()` checks
- Dynamic attribute access based on product type

### 3. **Encapsulation**
- Database models encapsulate product data and behavior
- Factory pattern for creating different product types
- Service classes for business logic

### 4. **Factory Pattern**
```python
class ProductFactory:
    @staticmethod
    def create_fertilizer(db, data) -> Fertilizer
    @staticmethod
    def create_pesticide(db, data) -> Pesticide
    @staticmethod
    def create_seed(db, data) -> Seed
    @staticmethod
    def create_equipment(db, data) -> Equipment
```

## 📁 File Structure

```
backend/
├── models.py              # OOP class definitions with inheritance
├── product_system.py      # Factory and Service classes
├── product_routes.py      # API endpoints for products
├── main.py               # FastAPI app with integrated endpoints
├── create_sample_data.py # Sample data creation script
├── database.py           # Database configuration
└── auth.py              # Authentication utilities
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install fastapi uvicorn sqlalchemy pymysql python-multipart passlib[bcrypt]
```

### 2. Configure Database
Update `database.py` with your MySQL credentials:
```python
URL_DATABASE = 'mysql+pymysql://username:password@localhost:3306/database_name'
```

### 3. Create Sample Data
```bash
python create_sample_data.py
```

### 4. Run the API Server
```bash
uvicorn main:app --reload
```

## 📚 API Endpoints

### Product Management
- `GET /products` - Get all products (with filters)
- `GET /products/{id}` - Get specific product details
- `POST /products/fertilizers` - Create fertilizer
- `POST /products/pesticides` - Create pesticide
- `POST /products/seeds` - Create seed
- `POST /products/equipment` - Create equipment

### Cart Management
- `POST /cart/add` - Add item to cart
- `GET /cart` - Get user cart
- `DELETE /cart/{item_id}` - Remove from cart
- `PUT /cart/{item_id}` - Update quantity

### Category Specific
- `GET /api/products/categories/fertilizers`
- `GET /api/products/categories/pesticides`
- `GET /api/products/categories/seeds`
- `GET /api/products/categories/equipment`

## 🎯 OOP Demonstration Examples

### Creating Products (Factory Pattern)
```python
# Create a fertilizer
fertilizer_data = FertilizerCreate(
    name="NPK Organic Fertilizer",
    price=299.99,
    brand="GreenGrow",
    npk_ratio="10-10-10",
    organic=True
)
fertilizer = ProductFactory.create_fertilizer(db, fertilizer_data)
```

### Polymorphic Queries
```python
# Get all products (returns mixed types)
all_products = db.query(Product).all()

for product in all_products:
    print(f"Product: {product.name}")
    
    # Type-specific behavior
    if isinstance(product, Fertilizer):
        print(f"NPK: {product.npk_ratio}")
    elif isinstance(product, Pesticide):
        print(f"Active Ingredient: {product.active_ingredient}")
    elif isinstance(product, Seed):
        print(f"Germination Rate: {product.germination_rate}%")
    elif isinstance(product, Equipment):
        print(f"Power Source: {product.power_source}")
```

### Service Layer (Business Logic)
```python
# Search across all product types
products = ProductService.search_products(db, "organic")

# Filter by category
fertilizers = ProductService.get_all_products(db, category="fertilizer")

# Update stock (works for any product type)
ProductService.update_stock(db, product_id, new_stock)
```

## 🔍 Database Schema

The inheritance is implemented using SQLAlchemy's **Table Inheritance** pattern:

1. **Products Table**: Contains all common fields
2. **Fertilizers Table**: Contains fertilizer-specific fields + foreign key to products
3. **Pesticides Table**: Contains pesticide-specific fields + foreign key to products
4. **Seeds Table**: Contains seed-specific fields + foreign key to products
5. **Equipment Table**: Contains equipment-specific fields + foreign key to products

## 🎨 Frontend Integration

The OOP backend integrates seamlessly with the React frontend:

```javascript
// Fetch all products (polymorphic)
const products = await fetch('/products');

// Fetch specific category
const fertilizers = await fetch('/products?category=fertilizer');

// Add to cart (works with any product type)
await fetch('/cart/add', {
    method: 'POST',
    body: formData
});
```

## 📈 Benefits of This OOP Design

1. **Maintainability**: Easy to add new product types
2. **Reusability**: Common functionality shared through inheritance
3. **Scalability**: Service layer handles business logic separately
4. **Type Safety**: Strong typing with specific product attributes
5. **Flexibility**: Polymorphic queries and operations
6. **Extensibility**: Factory pattern makes adding new types simple

## 🧪 Testing the OOP Features

Run the sample data creation script to see OOP inheritance in action:

```bash
python create_sample_data.py
```

This will:
- Create products of all 4 types
- Demonstrate polymorphic queries
- Show type-specific attribute access
- Display inheritance hierarchy
- Provide usage statistics

## 📋 Additional Models

The system also includes supporting models:
- `CartItem` - Shopping cart management
- `Order` & `OrderItem` - Purchase tracking
- `ProductReview` - Customer feedback
- `User` - Authentication and user management

This OOP implementation provides a solid foundation for a scalable agriculture e-commerce platform with proper separation of concerns and maintainable code structure.