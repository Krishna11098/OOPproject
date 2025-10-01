from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
import razorpay
import os
from dotenv import load_dotenv
from database import get_db
from models import User, Product, Order as DBOrder, OrderItem as DBOrderItem
from auth import get_current_user

# Load environment variables
load_dotenv()

# Initialize Razorpay client
razorpay_client = None
try:
    razorpay_client = razorpay.Client(
        auth=(
            os.getenv('RAZORPAY_KEY_ID', 'your_test_key_id'), 
            os.getenv('RAZORPAY_KEY_SECRET', 'your_test_key_secret')
        )
    )
except Exception as e:
    print(f"Warning: Razorpay client initialization failed: {e}")

router = APIRouter(prefix="/orders", tags=["orders"])

# Test endpoint to verify order routes are working
@router.get("/test")
async def test_orders():
    """Test endpoint to verify order routes are accessible"""
    return {"message": "Order routes are working!", "status": "success"}

# Pydantic models for request/response
class OrderItemRequest(BaseModel):
    product_id: int
    product_name: str
    product_type: str  # fertilizer, pesticide, seed, equipment
    price: float
    quantity: int

class CreateOrderRequest(BaseModel):
    items: List[OrderItemRequest]
    total_amount: float
    order_type: str  # "cart" or "buynow"
    shipping_address: str = None
    payment_status: str = "pending"  # For Razorpay integration

@router.post("/create", response_model=dict)
async def create_order(
    order_data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new order for buy now or cart checkout"""
    try:
        print(f"📦 Order creation started for user: {current_user.username}")
        print(f"📦 Order data: {order_data}")
        
        # Validate items
        if not order_data.items:
            raise HTTPException(status_code=400, detail="Order must contain at least one item")
        
        # Calculate total for verification (including tax and shipping like frontend)
        subtotal = sum(item.price * item.quantity for item in order_data.items)
        tax = round(subtotal * 0.18)  # 18% tax like frontend
        shipping = 0 if subtotal > 500 else 50  # Free shipping over 500 like frontend
        calculated_total = subtotal + tax + shipping
        
        print(f"📦 Backend calculation - Subtotal: {subtotal}, Tax: {tax}, Shipping: {shipping}, Total: {calculated_total}")
        print(f"📦 Frontend sent total: {order_data.total_amount}")
        
        if abs(calculated_total - order_data.total_amount) > 1.0:  # Allow 1 rupee difference for rounding
            raise HTTPException(
                status_code=400, 
                detail=f"Total amount mismatch. Expected: {calculated_total}, Received: {order_data.total_amount}"
            )
        
        print(f"📦 Creating order in database...")
        
        # Calculate estimated delivery date (7-10 business days)
        from datetime import timedelta
        import random
        
        # Add 7-10 business days for delivery
        business_days_to_add = random.randint(7, 10)
        current_date = datetime.now()
        delivery_date = current_date + timedelta(days=business_days_to_add)
        
        # Skip weekends (optional enhancement)
        while delivery_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            delivery_date += timedelta(days=1)
        
        print(f"📦 Estimated delivery date: {delivery_date.strftime('%Y-%m-%d')}")
        
        # Create order in database
        new_order = DBOrder(
            user_id=current_user.id,
            total_amount=order_data.total_amount,
            order_type=order_data.order_type,
            status="pending",
            shipping_address=order_data.shipping_address,
            payment_status=order_data.payment_status,
            delivery_date=delivery_date  # ✅ Now setting delivery date
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        # Create order items
        for item_data in order_data.items:
            order_item = DBOrderItem(
                order_id=new_order.id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                price_per_unit=item_data.price,
                total_price=item_data.price * item_data.quantity
            )
            db.add(order_item)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Order created successfully",
            "order_id": new_order.id,
            "order_details": {
                "status": new_order.status,
                "payment_status": new_order.payment_status,
                "shipping_address": new_order.shipping_address,
                "order_date": new_order.order_date.isoformat(),
                "estimated_delivery": new_order.delivery_date.isoformat() if new_order.delivery_date else None,
                "total_amount": float(new_order.total_amount)
            }
        }
        
    except Exception as e:
        print(f"❌ Order creation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.get("/my-orders", response_model=List[dict])
async def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all orders for the current user"""
    try:
        orders = db.query(DBOrder).filter(DBOrder.user_id == current_user.id).all()
        
        order_list = []
        for order in orders:
            order_items = db.query(DBOrderItem).filter(DBOrderItem.order_id == order.id).all()
            items_data = []
            
            for item in order_items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    items_data.append({
                        "product_id": product.id,
                        "product_name": product.name,
                        "product_type": product.product_type,
                        "price": float(item.price_per_unit),
                        "quantity": item.quantity
                    })
            
            order_list.append({
                "id": order.id,
                "total_amount": float(order.total_amount),
                "order_type": order.order_type,
                "status": order.status,
                "created_at": order.created_at,
                "shipping_address": order.shipping_address,
                "payment_status": order.payment_status,
                "items": items_data
            })
        
        return order_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get orders: {str(e)}")

@router.get("/{order_id}", response_model=dict)
async def get_order_by_id(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific order by ID"""
    try:
        order = db.query(DBOrder).filter(DBOrder.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get order items
        order_items = db.query(DBOrderItem).filter(DBOrderItem.order_id == order.id).all()
        items_data = []
        
        for item in order_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                items_data.append({
                    "product_id": product.id,
                    "product_name": product.name,
                    "product_type": product.product_type,
                    "price": float(item.price),
                    "quantity": item.quantity
                })
        
        return {
            "id": order.id,
            "total_amount": float(order.total_amount),
            "order_type": order.order_type,
            "status": order.status,
            "created_at": order.created_at,
            "shipping_address": order.shipping_address,
            "payment_status": order.payment_status,
            "items": items_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order: {str(e)}")

@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update order status"""
    try:
        valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
        
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        order = db.query(DBOrder).filter(DBOrder.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        order.status = status
        db.commit()
        
        return {
            "success": True,
            "message": f"Order status updated to {status}"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update order status: {str(e)}")

@router.post("/buynow")
async def buy_now_direct(
    product_id: int,
    quantity: int = 1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create immediate buy now order for a single product"""
    try:
        # Fetch product from database
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        order_item = OrderItemRequest(
            product_id=product_id,
            product_name=product.name,
            product_type=product.product_type,
            price=float(product.price),
            quantity=quantity
        )
        
        order_data = CreateOrderRequest(
            items=[order_item],
            total_amount=float(product.price) * quantity,
            order_type="buynow",
            payment_status="pending"
        )
        
        return await create_order(order_data, current_user, db)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create buy now order: {str(e)}")

class RazorpayOrderRequest(BaseModel):
    order_id: int

@router.post("/create-razorpay-order")
async def create_razorpay_order(
    request: RazorpayOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Razorpay order for existing order"""
    try:
        # Find the order
        order = db.query(DBOrder).filter(DBOrder.id == request.order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not razorpay_client:
            # Fallback to mock data if Razorpay client not available
            razorpay_order_data = {
                "id": f"order_{request.order_id}_{int(datetime.now().timestamp())}",
                "amount": int(float(order.total_amount) * 100),
                "currency": "INR",
                "receipt": f"order_rcptid_{request.order_id}",
                "status": "created"
            }
        else:
            # Create actual Razorpay order
            razorpay_order_data = razorpay_client.order.create({
                "amount": int(float(order.total_amount) * 100),  # Amount in paise
                "currency": "INR",
                "receipt": f"order_rcptid_{request.order_id}",
                "notes": {
                    "order_id": str(request.order_id),
                    "user_id": str(current_user.id)
                }
            })
        
        return {
            "success": True,
            "razorpay_order": razorpay_order_data,
            "key_id": os.getenv('RAZORPAY_KEY_ID', 'test_key_id'),
            "order_id": request.order_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(e)}")

# Pydantic model for payment verification
class PaymentVerificationRequest(BaseModel):
    order_id: int
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

@router.post("/verify-razorpay-payment")
async def verify_razorpay_payment(
    payment_data: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment signature and update order status"""
    try:
        # Find the order
        order = db.query(DBOrder).filter(DBOrder.id == payment_data.order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if razorpay_client:
            # Verify payment signature
            try:
                razorpay_client.utility.verify_payment_signature({
                    'razorpay_order_id': payment_data.razorpay_order_id,
                    'razorpay_payment_id': payment_data.razorpay_payment_id,
                    'razorpay_signature': payment_data.razorpay_signature
                })
                
                # Update order status
                order.status = "confirmed"
                order.payment_status = "completed"
                db.commit()
                
                return {
                    "success": True,
                    "message": "Payment verified successfully",
                    "order_id": payment_data.order_id
                }
                
            except Exception as signature_error:
                raise HTTPException(status_code=400, detail="Payment verification failed")
        else:
            # Mock verification for testing
            order.status = "confirmed"
            order.payment_status = "completed"
            db.commit()
            
            return {
                "success": True,
                "message": "Payment verified successfully (mock)",
                "order_id": payment_data.order_id
            }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to verify payment: {str(e)}")

