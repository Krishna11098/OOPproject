# Razorpay Integration Guide

This document explains how to integrate Razorpay payment gateway with your agriculture marketplace.

## Backend Integration

### 1. Install Razorpay Python SDK

```bash
pip install razorpay
```

### 2. Environment Variables

Add these to your `.env` file:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Updated Backend Routes

The following routes are now available for Razorpay integration:

#### Create Razorpay Order
- **POST** `/orders/create-razorpay-order`
- **Body**: `{"order_id": 123}`
- **Response**: Razorpay order details for frontend

#### Verify Payment
- **POST** `/orders/verify-razorpay-payment`
- **Body**: 
```json
{
  "order_id": 123,
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx", 
  "razorpay_signature": "signature_xxxxx"
}
```

### 4. Complete Backend Implementation

```python
import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET'))
)

@router.post("/create-razorpay-order")
async def create_razorpay_order(
    order_id: int,
    current_user: User = Depends(get_current_user)
):
    # Find the order
    order = next((order for order in orders_db if order["id"] == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Create Razorpay order
    razorpay_order = razorpay_client.order.create({
        "amount": int(order["total_amount"] * 100),  # Amount in paise
        "currency": "INR",
        "receipt": f"order_rcptid_{order_id}",
        "notes": {
            "order_id": order_id,
            "user_id": current_user.id
        }
    })
    
    # Update order with Razorpay order ID
    order["razorpay_order_id"] = razorpay_order["id"]
    
    return {
        "success": True,
        "razorpay_order": razorpay_order,
        "key_id": os.getenv('RAZORPAY_KEY_ID')
    }

@router.post("/verify-razorpay-payment")
async def verify_razorpay_payment(
    order_id: int,
    razorpay_payment_id: str,
    razorpay_order_id: str,
    razorpay_signature: str,
    current_user: User = Depends(get_current_user)
):
    # Verify payment signature
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        # Update order status
        order = next((order for order in orders_db if order["id"] == order_id), None)
        order["status"] = "confirmed"
        order["payment_status"] = "completed"
        order["razorpay_payment_id"] = razorpay_payment_id
        
        return {"success": True, "message": "Payment verified successfully"}
        
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")
```

## Frontend Integration

### 1. Install Razorpay JavaScript SDK

```bash
npm install razorpay
```

### 2. Add Razorpay Script to index.html

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 3. Cart Component Integration

Update your Cart.jsx to integrate with Razorpay:

```javascript
import { useNavigate } from 'react-router-dom';

const Cart = ({ user, cartItems, updateQuantity, removeFromCart }) => {
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      // Step 1: Create order in backend
      const orderResponse = await fetch('http://127.0.0.1:8000/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems,
          total_amount: calculateTotal(),
          shipping_address: "User Address" // Get from form
        })
      });

      const orderData = await orderResponse.json();
      
      if (orderData.success) {
        // Step 2: Create Razorpay order
        const razorpayResponse = await fetch(`http://127.0.0.1:8000/orders/create-razorpay-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            order_id: orderData.order.id
          })
        });

        const razorpayData = await razorpayResponse.json();

        // Step 3: Open Razorpay checkout
        const options = {
          key: razorpayData.key_id,
          amount: razorpayData.razorpay_order.amount,
          currency: razorpayData.razorpay_order.currency,
          name: 'Agriculture Marketplace',
          description: 'Order Payment',
          order_id: razorpayData.razorpay_order.id,
          handler: async function (response) {
            // Step 4: Verify payment
            try {
              const verifyResponse = await fetch(`http://127.0.0.1:8000/orders/verify-razorpay-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  order_id: orderData.order.id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                // Redirect to success page
                navigate('/payment/success', {
                  state: {
                    payment: {
                      payment_id: response.razorpay_payment_id,
                      order_id: orderData.order.id,
                      status: 'success',
                      amount: calculateTotal(),
                      payment_method: 'razorpay'
                    },
                    order: orderData.order
                  }
                });
              }
            } catch (error) {
              console.error('Payment verification failed:', error);
              navigate('/payment/failure', {
                state: {
                  error: { message: 'Payment verification failed' },
                  order: orderData.order
                }
              });
            }
          },
          prefill: {
            name: user?.username || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#4CAF50'
          },
          modal: {
            ondismiss: function() {
              console.log('Payment cancelled by user');
              // Handle payment cancellation
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  // Rest of your Cart component code...
};
```

### 4. Buy Now Integration

Similarly, update your ItemDetail.jsx for Buy Now functionality:

```javascript
const handleBuyNow = async () => {
  try {
    // Create buy now order
    const orderResponse = await fetch('http://127.0.0.1:8000/orders/buynow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        product_id: product.id,
        quantity: quantity
      })
    });

    const orderData = await orderResponse.json();
    
    // Follow same Razorpay integration as Cart checkout
    // ... (same code as above)
    
  } catch (error) {
    console.error('Buy now failed:', error);
  }
};
```

## Payment Flow

### Complete Flow:
1. **User clicks checkout/buy now**
2. **Backend creates order** → `POST /cart/checkout` or `/orders/buynow`
3. **Backend creates Razorpay order** → `POST /orders/create-razorpay-order`
4. **Frontend opens Razorpay modal** → User enters payment details
5. **Payment success callback** → `POST /orders/verify-razorpay-payment`
6. **Redirect to success/failure page**

### Error Handling:
- **Payment cancelled** → User dismisses modal
- **Payment failed** → Razorpay returns error
- **Verification failed** → Backend signature verification fails

## Security Considerations

1. **Never expose Key Secret** on frontend
2. **Always verify payment signature** on backend
3. **Use HTTPS** in production
4. **Validate order amounts** before payment
5. **Implement rate limiting** for payment endpoints

## Testing

### Test Credentials:
- **Key ID**: Use your test key ID from Razorpay dashboard
- **Test Cards**: Use Razorpay test card numbers
- **Test UPI**: Use test UPI IDs provided by Razorpay

### Test Flow:
1. Create test orders with small amounts
2. Use test payment methods
3. Verify payment verification works
4. Test failure scenarios

## Production Deployment

1. **Switch to production keys** in environment variables
2. **Configure webhooks** for payment status updates
3. **Implement proper logging** for payment transactions
4. **Set up monitoring** for failed payments
5. **Configure proper error handling** and user notifications

## Additional Features

### Webhooks:
```python
@app.post("/razorpay/webhook")
async def razorpay_webhook(request: Request):
    # Handle Razorpay webhooks for payment status updates
    payload = await request.body()
    signature = request.headers.get('X-Razorpay-Signature')
    
    # Verify webhook signature and process payment updates
    pass
```

### Refunds:
```python
@router.post("/refund/{payment_id}")
async def create_refund(payment_id: str, amount: int):
    # Create refund using Razorpay API
    refund = razorpay_client.payment.refund(payment_id, amount)
    return refund
```

This integration provides a complete, secure payment solution using Razorpay for your agriculture marketplace! 🚀