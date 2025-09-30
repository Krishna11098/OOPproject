from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
from models import User, Product, CartItem as DBCartItem
from auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])

# Pydantic models for cart operations (renamed to avoid conflicts)
class CartItemResponse(BaseModel):
    product_id: int
    product_name: str
    product_type: str
    price: float
    quantity: int
    image_url: str = None

class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1

class UpdateCartRequest(BaseModel):
    product_id: int
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[CartItemResponse]
    total_amount: float
    shipping_address: str
    notes: str = None

@router.post("/add")
async def add_to_cart(
    request: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to user's cart"""
    try:
        # Fetch real product from database
        product = db.query(Product).filter(Product.id == request.product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check if item already exists in cart
        existing_cart_item = db.query(DBCartItem).filter(
            DBCartItem.user_id == current_user.id,
            DBCartItem.product_id == request.product_id
        ).first()
        
        if existing_cart_item:
            # Increment quantity of existing item
            existing_cart_item.quantity += request.quantity
            db.commit()
            db.refresh(existing_cart_item)
            
            return {
                "success": True,
                "message": f"Added {request.quantity} more {product.name} to cart (total: {existing_cart_item.quantity})",
                "cart_count": existing_cart_item.quantity,
                "action": "incremented"
            }
        else:
            # Create new cart item
            new_cart_item = DBCartItem(
                user_id=current_user.id,
                product_id=request.product_id,
                quantity=request.quantity
            )
            db.add(new_cart_item)
            db.commit()
            db.refresh(new_cart_item)
            
            return {
                "success": True,
                "message": f"Added {product.name} to cart",
                "cart_count": request.quantity,
                "action": "added"
            }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add item to cart: {str(e)}")

@router.get("/items", response_model=List[dict])
async def get_cart_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all items in user's cart"""
    try:
        cart_items = db.query(DBCartItem).filter(DBCartItem.user_id == current_user.id).all()
        
        cart_data = []
        for cart_item in cart_items:
            product = db.query(Product).filter(Product.id == cart_item.product_id).first()
            if product:
                cart_data.append({
                    "product_id": product.id,
                    "product_name": product.name,
                    "product_type": product.product_type,
                    "price": float(product.price),
                    "quantity": cart_item.quantity,
                    "image_url": product.image_url or "/images/default.jpg"
                })
        
        return cart_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cart items: {str(e)}")

@router.put("/update")
async def update_cart_item(
    request: UpdateCartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update quantity of item in cart"""
    try:
        cart_item = db.query(DBCartItem).filter(
            DBCartItem.user_id == current_user.id,
            DBCartItem.product_id == request.product_id
        ).first()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        
        if request.quantity <= 0:
            db.delete(cart_item)
            db.commit()
            return {"success": True, "message": "Item removed from cart"}
        else:
            cart_item.quantity = request.quantity
            db.commit()
            db.refresh(cart_item)
            return {"success": True, "message": "Cart updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update cart: {str(e)}")

@router.delete("/remove/{product_id}")
async def remove_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    try:
        cart_item = db.query(DBCartItem).filter(
            DBCartItem.user_id == current_user.id,
            DBCartItem.product_id == product_id
        ).first()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found in cart")
        
        # Store product name for response
        product = db.query(Product).filter(Product.id == product_id).first()
        product_name = product.name if product else f"Product {product_id}"
        
        db.delete(cart_item)
        db.commit()
        
        return {
            "success": True, 
            "message": f"{product_name} removed from cart",
            "product_id": product_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove item: {str(e)}")

@router.delete("/clear")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all items from cart"""
    try:
        db.query(DBCartItem).filter(DBCartItem.user_id == current_user.id).delete()
        db.commit()
        
        return {"success": True, "message": "Cart cleared"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cart: {str(e)}")

@router.get("/count")
async def get_cart_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total number of items in cart"""
    try:
        cart_items = db.query(DBCartItem).filter(DBCartItem.user_id == current_user.id).all()
        total_count = sum(item.quantity for item in cart_items)
        return {"count": total_count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cart count: {str(e)}")

@router.get("/total")
async def get_cart_total(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total amount of items in cart"""
    try:
        cart_items = db.query(DBCartItem).filter(DBCartItem.user_id == current_user.id).all()
        
        total_amount = 0.0
        total_quantity = 0
        
        for cart_item in cart_items:
            product = db.query(Product).filter(Product.id == cart_item.product_id).first()
            if product:
                total_amount += float(product.price) * cart_item.quantity
                total_quantity += cart_item.quantity
        
        return {
            "total": round(total_amount, 2),
            "items": len(cart_items),
            "quantity": total_quantity
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cart total: {str(e)}")

@router.post("/checkout")
async def checkout_cart(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Checkout cart and create order"""
    try:
        # Import here to avoid circular import
        from routes.order_routes import CreateOrderRequest, create_order, OrderItem
        
        if not request.items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Convert cart items to order items
        order_items = []
        for cart_item in request.items:
            order_item = OrderItem(
                product_id=cart_item.product_id,
                product_name=cart_item.product_name,
                product_type=cart_item.product_type,
                price=cart_item.price,
                quantity=cart_item.quantity
            )
            order_items.append(order_item)
        
        # Create order data
        order_data = CreateOrderRequest(
            items=order_items,
            total_amount=request.total_amount,
            order_type="cart",
            shipping_address=request.shipping_address,
            payment_status="pending"
        )
        
        # Create the order
        order_response = await create_order(order_data, current_user, db)
        
        # Clear cart after successful checkout
        db.query(DBCartItem).filter(DBCartItem.user_id == current_user.id).delete()
        db.commit()
        
        return {
            "success": True,
            "message": "Checkout successful",
            "order": order_response,
            "next_step": "payment"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")

@router.post("/save-for-later/{product_id}")
async def save_for_later(
    product_id: int,
    current_user: User = Depends(get_current_user)
):
    """Move item from cart to saved items"""
    # This would typically save to a separate "saved items" storage
    # For now, just remove from cart
    return await remove_from_cart(product_id, current_user)