#!/usr/bin/env python3
"""
Sample Data Creator for Agriculture Product Management System
Demonstrates OOP inheritance with Fertilizer, Pesticide, Seed, and Equipment classes
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal, engine
    import models
    from datetime import datetime
    
    # Create all tables
    models.Base.metadata.create_all(bind=engine)
    
    def create_sample_data():
        """Create sample products demonstrating OOP inheritance"""
        
        db = SessionLocal()
        
        try:
            print("🌱 Creating Sample Agriculture Products")
            print("="*50)
            
            # Sample Fertilizers
            fertilizers_data = [
                {
                    "name": "NPK Organic Fertilizer",
                    "price": 299.99,
                    "brand": "GreenGrow",
                    "title": "Premium Organic NPK Fertilizer for All Plants",
                    "description": "High-quality organic fertilizer with balanced NPK ratio for healthy plant growth. Made from natural ingredients to promote robust growth and improve soil health.",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2021/3/WW/XX/YY/6693880/organic-npk-fertilizer-500x500.jpg",
                    "stock_quantity": 50,
                    "npk_ratio": "10-10-10",
                    "organic": True,
                    "fertilizer_type": "granular",
                    "coverage_area": "500 sq ft",
                    "application_method": "broadcast and water",
                    "nutrients": '{"nitrogen": 10, "phosphorus": 10, "potassium": 10}',
                    "suitable_crops": '["vegetables", "fruits", "flowers"]'
                },
                {
                    "name": "Liquid Micronutrient Fertilizer",
                    "price": 189.50,
                    "brand": "PlantBoost",
                    "title": "Complete Micronutrient Solution for Plants",
                    "description": "Comprehensive liquid fertilizer containing essential micronutrients for optimal plant health",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2022/9/EB/NU/IG/23435352/liquid-fertilizer-500x500.jpg",
                    "stock_quantity": 30,
                    "npk_ratio": "5-5-5",
                    "organic": False,
                    "fertilizer_type": "liquid",
                    "coverage_area": "1000 sq ft",
                    "application_method": "foliar spray or soil drench",
                    "nutrients": '{"iron": 2, "zinc": 1, "manganese": 1, "boron": 0.5}',
                    "suitable_crops": '["citrus", "vegetables", "ornamentals"]'
                },
                {
                    "name": "Urea Nitrogen Fertilizer",
                    "price": 249.00,
                    "brand": "FarmPro",
                    "title": "High Nitrogen Urea Fertilizer - 46% N",
                    "description": "Premium quality urea fertilizer with 46% nitrogen content for rapid plant growth and lush green foliage",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2023/3/295033806/NN/NN/NN/6693880/urea-fertilizer.jpg",
                    "stock_quantity": 100,
                    "npk_ratio": "46-0-0",
                    "organic": False,
                    "fertilizer_type": "granular",
                    "coverage_area": "800 sq ft",
                    "application_method": "broadcast or side dressing",
                    "nutrients": '{"nitrogen": 46}',
                    "suitable_crops": '["wheat", "rice", "corn", "vegetables"]'
                },
                {
                    "name": "Vermicompost Organic Fertilizer",
                    "price": 199.00,
                    "brand": "EcoGrow",
                    "title": "100% Organic Vermicompost - Rich in Nutrients",
                    "description": "Premium vermicompost made from earthworm castings, rich in beneficial microorganisms and nutrients",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2021/8/YE/WH/DP/6693880/vermicompost-500x500.jpg",
                    "stock_quantity": 75,
                    "npk_ratio": "3-2-2",
                    "organic": True,
                    "fertilizer_type": "powder",
                    "coverage_area": "400 sq ft",
                    "application_method": "mix with soil",
                    "nutrients": '{"nitrogen": 3, "phosphorus": 2, "potassium": 2, "organic_matter": 40}',
                    "suitable_crops": '["all crops", "vegetables", "fruits", "flowers"]'
                },
                {
                    "name": "DAP Phosphate Fertilizer",
                    "price": 279.00,
                    "brand": "CropMax",
                    "title": "Di-Ammonium Phosphate - High Phosphorus",
                    "description": "DAP fertilizer with high phosphorus content for strong root development and flowering",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2023/5/309876543/KK/KK/KK/6693880/dap-fertilizer.jpg",
                    "stock_quantity": 60,
                    "npk_ratio": "18-46-0",
                    "organic": False,
                    "fertilizer_type": "granular",
                    "coverage_area": "600 sq ft",
                    "application_method": "basal application",
                    "nutrients": '{"nitrogen": 18, "phosphorus": 46}',
                    "suitable_crops": '["cereals", "pulses", "oilseeds", "vegetables"]'
                },
                {
                    "name": "Seaweed Extract Fertilizer",
                    "price": 349.00,
                    "brand": "OceanGrow",
                    "title": "Natural Seaweed Extract - Growth Booster",
                    "description": "Organic seaweed extract rich in growth hormones, vitamins, and trace elements for enhanced plant vigor",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2022/11/VV/VV/VV/23435352/seaweed-fertilizer.jpg",
                    "stock_quantity": 40,
                    "npk_ratio": "1-0-2",
                    "organic": True,
                    "fertilizer_type": "liquid",
                    "coverage_area": "1200 sq ft",
                    "application_method": "foliar spray",
                    "nutrients": '{"potassium": 2, "trace_elements": "high", "growth_hormones": "present"}',
                    "suitable_crops": '["all crops", "fruits", "vegetables", "ornamentals"]'
                }
            ]
            
            # Sample Pesticides
            pesticides_data = [
                {
                    "name": "Broad Spectrum Fungicide",
                    "price": 159.99,
                    "brand": "CropProtect",
                    "title": "Advanced Fungicide for Plant Disease Control",
                    "description": "Effective fungicide for controlling various plant diseases including powdery mildew, rust, and leaf spot",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2023/7/326789012/AA/BB/CC/6693880/fungicide-spray.jpg",
                    "stock_quantity": 25,
                    "active_ingredient": "Propiconazole",
                    "pesticide_type": "fungicide",
                    "toxicity_level": "low",
                    "application_rate": "2ml per liter",
                    "target_pests": '["powdery mildew", "rust", "leaf spot", "anthracnose"]',
                    "safety_period": "7 days before harvest",
                    "dilution_ratio": "1:500"
                },
                {
                    "name": "Organic Neem Insecticide",
                    "price": 139.75,
                    "brand": "BioSafe",
                    "title": "Natural Insect Control Solution",
                    "description": "Organic insecticide made from natural neem extract for safe pest control",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2022/6/QQ/RR/SS/23435352/neem-oil-pesticide.jpg",
                    "stock_quantity": 40,
                    "active_ingredient": "Neem Extract",
                    "pesticide_type": "insecticide",
                    "toxicity_level": "very low",
                    "application_rate": "5ml per liter",
                    "target_pests": '["aphids", "whiteflies", "thrips", "spider mites"]',
                    "safety_period": "1 day before harvest",
                    "dilution_ratio": "1:200"
                },
                {
                    "name": "Cypermethrin Insecticide",
                    "price": 179.00,
                    "brand": "PestKill",
                    "title": "Powerful Insecticide for Crop Protection",
                    "description": "Synthetic pyrethroid insecticide effective against a wide range of insect pests",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2023/4/301234567/DD/EE/FF/6693880/cypermethrin-insecticide.jpg",
                    "stock_quantity": 35,
                    "active_ingredient": "Cypermethrin 10% EC",
                    "pesticide_type": "insecticide",
                    "toxicity_level": "medium",
                    "application_rate": "1.5ml per liter",
                    "target_pests": '["bollworms", "caterpillars", "beetles", "leafhoppers"]',
                    "safety_period": "10 days before harvest",
                    "dilution_ratio": "1:666"
                },
                {
                    "name": "Mancozeb Fungicide",
                    "price": 149.00,
                    "brand": "FungiShield",
                    "title": "Protective Fungicide for Multiple Crops",
                    "description": "Broad-spectrum contact fungicide for prevention and control of fungal diseases",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2023/2/289012345/GG/HH/II/6693880/mancozeb-fungicide.jpg",
                    "stock_quantity": 50,
                    "active_ingredient": "Mancozeb 75% WP",
                    "pesticide_type": "fungicide",
                    "toxicity_level": "low",
                    "application_rate": "2.5g per liter",
                    "target_pests": '["late blight", "early blight", "downy mildew", "black spot"]',
                    "safety_period": "7 days before harvest",
                    "dilution_ratio": "1:400"
                },
                {
                    "name": "Glyphosate Herbicide",
                    "price": 199.00,
                    "brand": "WeedOut",
                    "title": "Non-Selective Herbicide - Total Weed Control",
                    "description": "Systemic herbicide for effective control of annual and perennial weeds",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2022/10/JJ/KK/LL/23435352/glyphosate-herbicide.jpg",
                    "stock_quantity": 45,
                    "active_ingredient": "Glyphosate 41% SL",
                    "pesticide_type": "herbicide",
                    "toxicity_level": "medium",
                    "application_rate": "30ml per liter",
                    "target_pests": '["grasses", "broadleaf weeds", "sedges", "perennial weeds"]',
                    "safety_period": "apply before planting",
                    "dilution_ratio": "1:33"
                },
                {
                    "name": "Imidacloprid Systemic Insecticide",
                    "price": 189.00,
                    "brand": "SystemGuard",
                    "title": "Systemic Insecticide for Sucking Pests",
                    "description": "Long-lasting systemic insecticide for control of sucking and chewing insects",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2023/6/318901234/MM/NN/OO/6693880/imidacloprid-insecticide.jpg",
                    "stock_quantity": 30,
                    "active_ingredient": "Imidacloprid 17.8% SL",
                    "pesticide_type": "insecticide",
                    "toxicity_level": "medium",
                    "application_rate": "0.5ml per liter",
                    "target_pests": '["aphids", "jassids", "whiteflies", "termites"]',
                    "safety_period": "14 days before harvest",
                    "dilution_ratio": "1:2000"
                },
                {
                    "name": "Copper Oxychloride Fungicide",
                    "price": 129.00,
                    "brand": "CopperCure",
                    "title": "Copper-Based Fungicide & Bactericide",
                    "description": "Protective copper fungicide effective against bacterial and fungal diseases",
                    "image_url": "https://5.imimg.com/data5/SELLER/Default/2022/8/PP/QQ/RR/23435352/copper-fungicide.jpg",
                    "stock_quantity": 55,
                    "active_ingredient": "Copper Oxychloride 50% WP",
                    "pesticide_type": "fungicide",
                    "toxicity_level": "low",
                    "application_rate": "3g per liter",
                    "target_pests": '["bacterial blight", "leaf spot", "fruit rot", "downy mildew"]',
                    "safety_period": "5 days before harvest",
                    "dilution_ratio": "1:333"
                }
            ]
            
            # Sample Seeds
            seeds_data = [
                {
                    "name": "Hybrid Tomato Seeds",
                    "price": 49.99,
                    "brand": "SeedMaster",
                    "title": "High-Yield Hybrid Tomato Seeds - Premium Quality",
                    "description": "Disease-resistant hybrid tomato seeds with excellent yield and superior taste",
                    "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    "stock_quantity": 100,
                    "variety": "Cherry Tomato Hybrid",
                    "seed_type": "hybrid",
                    "germination_rate": 95.0,
                    "maturity_days": 75,
                    "planting_season": "spring-summer",
                    "spacing": "18 inches apart",
                    "soil_type": "well-drained loamy soil",
                    "sunlight_requirement": "full sun",
                    "water_requirement": "moderate"
                },
                {
                    "name": "Organic Lettuce Seeds",
                    "price": 29.99,
                    "brand": "OrganicHarvest",
                    "title": "Premium Organic Lettuce Seeds",
                    "description": "Certified organic lettuce seeds for fresh, crispy homegrown salads",
                    "image_url": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    "stock_quantity": 80,
                    "variety": "Butterhead Lettuce",
                    "seed_type": "open-pollinated",
                    "germination_rate": 90.0,
                    "maturity_days": 45,
                    "planting_season": "spring-fall",
                    "spacing": "8 inches apart",
                    "soil_type": "rich, well-drained soil",
                    "sunlight_requirement": "partial shade to full sun",
                    "water_requirement": "high"
                }
            ]
            
            # Sample Equipment
            equipment_data = [
                {
                    "name": "Battery Powered Garden Sprayer",
                    "price": 799.00,
                    "brand": "AgroTools",
                    "title": "Professional Battery-Powered Garden Sprayer",
                    "description": "High-capacity rechargeable sprayer for efficient application of fertilizers and pesticides",
                    "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    "stock_quantity": 15,
                    "equipment_type": "spraying",
                    "power_source": "rechargeable lithium battery",
                    "material": "high-grade plastic with metal fittings",
                    "dimensions": "45cm x 25cm x 60cm",
                    "weight": "3.5 kg",
                    "warranty_period": "2 years",
                    "power_consumption": "12V, 8Ah battery",
                    "capacity": "20 liters"
                },
                {
                    "name": "Drip Irrigation Kit",
                    "price": 1299.00,
                    "brand": "WaterWise",
                    "title": "Complete Drip Irrigation System",
                    "description": "Comprehensive drip irrigation kit for water-efficient garden watering",
                    "image_url": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    "stock_quantity": 20,
                    "equipment_type": "irrigation",
                    "power_source": "water pressure",
                    "material": "UV-resistant plastic tubing",
                    "dimensions": "covers up to 1000 sq ft",
                    "weight": "5.2 kg",
                    "warranty_period": "3 years",
                    "power_consumption": "N/A",
                    "capacity": "adjustable flow rate"
                }
            ]
            
            # Create Fertilizers
            print("\n🧪 Creating Fertilizers...")
            for fert_data in fertilizers_data:
                fertilizer = models.Fertilizer(
                    name=fert_data["name"],
                    price=fert_data["price"],
                    brand=fert_data["brand"],
                    title=fert_data["title"],
                    description=fert_data["description"],
                    category="fertilizer",
                    image_url=fert_data["image_url"],
                    stock_quantity=fert_data["stock_quantity"],
                    rating=4.5,
                    review_count=25,
                    npk_ratio=fert_data["npk_ratio"],
                    organic=fert_data["organic"],
                    fertilizer_type=fert_data["fertilizer_type"],
                    coverage_area=fert_data["coverage_area"],
                    application_method=fert_data["application_method"],
                    nutrients=fert_data["nutrients"],
                    suitable_crops=fert_data["suitable_crops"]
                )
                db.add(fertilizer)
                print(f"  ✓ {fertilizer.name} - {fertilizer.brand}")
            
            # Create Pesticides
            print("\n🦠 Creating Pesticides...")
            for pest_data in pesticides_data:
                pesticide = models.Pesticide(
                    name=pest_data["name"],
                    price=pest_data["price"],
                    brand=pest_data["brand"],
                    title=pest_data["title"],
                    description=pest_data["description"],
                    category="pesticide",
                    image_url=pest_data["image_url"],
                    stock_quantity=pest_data["stock_quantity"],
                    rating=4.3,
                    review_count=18,
                    active_ingredient=pest_data["active_ingredient"],
                    pesticide_type=pest_data["pesticide_type"],
                    toxicity_level=pest_data["toxicity_level"],
                    application_rate=pest_data["application_rate"],
                    target_pests=pest_data["target_pests"],
                    safety_period=pest_data["safety_period"],
                    dilution_ratio=pest_data["dilution_ratio"]
                )
                db.add(pesticide)
                print(f"  ✓ {pesticide.name} - {pesticide.brand}")
            
            # Create Seeds
            print("\n🌱 Creating Seeds...")
            for seed_data in seeds_data:
                seed = models.Seed(
                    name=seed_data["name"],
                    price=seed_data["price"],
                    brand=seed_data["brand"],
                    title=seed_data["title"],
                    description=seed_data["description"],
                    category="seed",
                    image_url=seed_data["image_url"],
                    stock_quantity=seed_data["stock_quantity"],
                    rating=4.7,
                    review_count=42,
                    variety=seed_data["variety"],
                    seed_type=seed_data["seed_type"],
                    germination_rate=seed_data["germination_rate"],
                    maturity_days=seed_data["maturity_days"],
                    planting_season=seed_data["planting_season"],
                    spacing=seed_data["spacing"],
                    soil_type=seed_data["soil_type"],
                    sunlight_requirement=seed_data["sunlight_requirement"],
                    water_requirement=seed_data["water_requirement"]
                )
                db.add(seed)
                print(f"  ✓ {seed.name} - {seed.brand}")
            
            # Create Equipment
            print("\n🔧 Creating Equipment...")
            for equip_data in equipment_data:
                equipment = models.Equipment(
                    name=equip_data["name"],
                    price=equip_data["price"],
                    brand=equip_data["brand"],
                    title=equip_data["title"],
                    description=equip_data["description"],
                    category="equipment",
                    image_url=equip_data["image_url"],
                    stock_quantity=equip_data["stock_quantity"],
                    rating=4.6,
                    review_count=15,
                    equipment_type=equip_data["equipment_type"],
                    power_source=equip_data["power_source"],
                    material=equip_data["material"],
                    dimensions=equip_data["dimensions"],
                    weight=equip_data["weight"],
                    warranty_period=equip_data["warranty_period"],
                    power_consumption=equip_data["power_consumption"],
                    capacity=equip_data["capacity"]
                )
                db.add(equipment)
                print(f"  ✓ {equipment.name} - {equipment.brand}")
            
            # Commit all changes
            db.commit()
            
            print("\n✅ Sample data created successfully!")
            print("\n📊 Demonstrating OOP Inheritance:")
            print("-"*40)
            
            # Demonstrate polymorphism
            all_products = db.query(models.Product).all()
            
            for product in all_products:
                print(f"\nProduct: {product.name}")
                print(f"Type: {product.product_type}")
                print(f"Category: {product.category}")
                print(f"Price: ₹{product.price}")
                
                # Show specific attributes based on inheritance
                if isinstance(product, models.Fertilizer):
                    print(f"  🧪 NPK Ratio: {product.npk_ratio}")
                    print(f"  🌿 Organic: {product.organic}")
                    print(f"  📏 Coverage: {product.coverage_area}")
                
                elif isinstance(product, models.Pesticide):
                    print(f"  💊 Active Ingredient: {product.active_ingredient}")
                    print(f"  ⚠️  Toxicity: {product.toxicity_level}")
                    print(f"  🎯 Application Rate: {product.application_rate}")
                
                elif isinstance(product, models.Seed):
                    print(f"  🌱 Variety: {product.variety}")
                    print(f"  📈 Germination Rate: {product.germination_rate}%")
                    print(f"  ⏱️  Maturity: {product.maturity_days} days")
                
                elif isinstance(product, models.Equipment):
                    print(f"  🔧 Type: {product.equipment_type}")
                    print(f"  ⚡ Power: {product.power_source}")
                    print(f"  📦 Capacity: {product.capacity}")
            
            # Show category statistics
            print(f"\n📈 Product Statistics:")
            print("-"*25)
            fertilizer_count = db.query(models.Fertilizer).count()
            pesticide_count = db.query(models.Pesticide).count()
            seed_count = db.query(models.Seed).count()
            equipment_count = db.query(models.Equipment).count()
            total_count = db.query(models.Product).count()
            
            print(f"Fertilizers: {fertilizer_count}")
            print(f"Pesticides: {pesticide_count}")
            print(f"Seeds: {seed_count}")
            print(f"Equipment: {equipment_count}")
            print(f"Total Products: {total_count}")
            
        except Exception as e:
            print(f"❌ Error creating sample data: {e}")
            db.rollback()
        finally:
            db.close()
    
    if __name__ == "__main__":
        create_sample_data()

except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Please install required dependencies:")
    print("pip install fastapi sqlalchemy pymysql")
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure the database is properly configured")