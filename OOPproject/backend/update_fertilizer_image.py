#!/usr/bin/env python3
"""
Update NPK Organic Fertilizer image
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal
    import models
    
    def update_fertilizer_image():
        """Update the NPK Organic Fertilizer image"""
        
        db = SessionLocal()
        
        try:
            print("🔄 Updating NPK Organic Fertilizer image...")
            
            # Find the NPK Organic Fertilizer
            fertilizer = db.query(models.Product).filter(
                models.Product.name == "NPK Organic Fertilizer"
            ).first()
            
            if fertilizer:
                old_url = fertilizer.image_url
                new_url = "https://5.imimg.com/data5/SELLER/Default/2021/3/WW/XX/YY/6693880/organic-npk-fertilizer-500x500.jpg"
                
                fertilizer.image_url = new_url
                db.commit()
                
                print(f"✅ Updated image for: {fertilizer.name}")
                print(f"   Old: {old_url}")
                print(f"   New: {new_url}")
            else:
                print("❌ NPK Organic Fertilizer not found in database")
                print("   Available products:")
                products = db.query(models.Product).all()
                for p in products:
                    print(f"   - {p.name}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.rollback()
        finally:
            db.close()
    
    if __name__ == "__main__":
        update_fertilizer_image()

except Exception as e:
    print(f"❌ Error: {e}")
