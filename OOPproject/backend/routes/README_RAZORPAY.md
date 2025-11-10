# Backend Routes - Razorpay Integration

This document describes the backend routes for the agriculture marketplace with Razorpay payment integration.

## 🏗️ Architecture Overview

The system now uses **Razorpay** for payment processing instead of custom payment routes:
- **Order Management**: Create and track orders
- **Cart Management**: Add/remove items, checkout
- **Razorpay Integration**: Secure payment processing
- **Authentication**: Session-based user auth

## 🛣️ Available Routes

### 1. Order Routes (`/orders`)

#### Create Order
```http
POST /orders/create
```
- Creates new order for cart checkout or buy now
- **Body**: `CreateOrderRequest`
- **Response**: Order details with ID

#### Buy Now Direct
```http
POST /orders/buynow
```
- Creates immediate order for single product
- **Body**: `{"product_id": 1, "quantity": 2}`

#### Create Razorpay Order
```http
POST /orders/create-razorpay-order
```
- Creates Razorpay order for existing order
- **Body**: `{"order_id": 123}`
- **Response**: Razorpay order details + Key ID

#### Verify Razorpay Payment
```http
POST /orders/verify-razorpay-payment
```
- Verifies payment signature and updates order
- **Body**: 
```json
{
  "order_id": 123,
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

#### Get User Orders
```http
GET /orders/my-orders
```
- Returns all orders for current user

#### Get Order Details
```http
GET /orders/{order_id}
```
- Returns specific order details

#### Update Order Status
```http
PATCH /orders/{order_id}/status
```
- Updates order status (pending → confirmed → shipped → delivered)
- **Body**: `{"status": "confirmed"}`

### 2. Cart Routes (`/cart`)

#### Add to Cart
```http
POST /cart/add
```
- **Body**: `{"product_id": 1, "quantity": 2}`

#### Get Cart Items
```http
GET /cart/items
```
- Returns all items in user's cart

#### Update Quantity
```http
PUT /cart/update
```
- **Body**: `{"product_id": 1, "quantity": 3}`

#### Remove Item
```http
DELETE /cart/remove/{product_id}
```

#### Clear Cart
```http
DELETE /cart/clear
```

#### Get Cart Count
```http
GET /cart/count
```
- For navbar badge

#### Get Cart Total
```http
GET /cart/total
```
- Returns total amount and item count

#### Checkout Cart
```http
POST /cart/checkout
```
- Converts cart to order (ready for payment)
- **Body**: `CheckoutRequest`

## 💳 Razorpay Integration Flow

### Complete Payment Flow:
```
1. Create Order → POST /orders/create or /orders/buynow
2. Create Razorpay Order → POST /orders/create-razorpay-order
3. Frontend opens Razorpay checkout modal
4. User completes payment on Razorpay
5. Verify Payment → POST /orders/verify-razorpay-payment
6. Order status updated to "confirmed"
7. Redirect to success/failure page
```

### Required Setup:
1. **Install Razorpay SDK**: `pip install razorpay`
2. **Environment Variables**:
   ```env
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
3. **Frontend Script**: Add Razorpay checkout.js

### Security Features:
✅ **Payment signature verification**  
✅ **Server-side validation**  
✅ **Secure API key management**  
✅ **PCI DSS compliance via Razorpay**  

## 📊 Data Models

### Order Item
```json
{
  "product_id": 1,
  "product_name": "Organic Fertilizer",
  "product_type": "fertilizer", 
  "price": 25.99,
  "quantity": 2
}
```

### Create Order Request
```json
{
  "items": [OrderItem],
  "total_amount": 51.98,
  "order_type": "buynow", // or "cart"
  "shipping_address": "123 Farm Road",
  "payment_status": "pending"
}
```

### Cart Item
```json
{
  "product_id": 1,
  "product_name": "Organic Fertilizer",
  "product_type": "fertilizer",
  "price": 25.99,
  "quantity": 2,
  "image_url": "/images/fertilizer1.jpg"
}
```

## 🔄 Order Status Lifecycle

```
pending → confirmed → processing → shipped → delivered
                ↓
             cancelled (if needed)
```

- **pending**: Order created, awaiting payment
- **confirmed**: Payment verified successfully  
- **processing**: Order being prepared
- **shipped**: Order dispatched
- **delivered**: Order completed
- **cancelled**: Order cancelled

## 🛡️ Authentication & Security

### Required Headers:
```http
Cookie: session_id=xxx
```

### Error Responses:
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not logged in)
- **403**: Forbidden (access denied)
- **404**: Not Found (order/product not found)
- **500**: Internal Server Error

## 🎯 Usage Examples

### Frontend Cart Checkout:
```javascript
// 1. Checkout cart
const checkoutResponse = await fetch('/cart/checkout', {
  method: 'POST',
  body: JSON.stringify({
    items: cartItems,
    total_amount: total,
    shipping_address: address
  })
});

// 2. Create Razorpay order
const razorpayResponse = await fetch('/orders/create-razorpay-order', {
  method: 'POST', 
  body: JSON.stringify({ order_id: order.id })
});

// 3. Open Razorpay checkout
const options = {
  key: razorpayData.key_id,
  amount: razorpayData.razorpay_order.amount,
  order_id: razorpayData.razorpay_order.id,
  handler: async (response) => {
    // 4. Verify payment
    await fetch('/orders/verify-razorpay-payment', {
      method: 'POST',
      body: JSON.stringify({
        order_id: order.id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature
      })
    });
  }
};
new Razorpay(options).open();
```

## 🧪 Testing

### Test Environment:
- Use Razorpay test credentials from dashboard
- Test card numbers: Provided by Razorpay
- Test UPI: Use Razorpay test UPI IDs

### Test Scenarios:
1. **Successful Payment**: Use valid test cards
2. **Failed Payment**: Use invalid test cards  
3. **Payment Cancellation**: Close Razorpay modal
4. **Signature Verification**: Test with invalid signatures

## 📁 Removed Components

The following components were removed for Razorpay integration:
- ❌ `payment_routes.py` - Custom payment processing
- ❌ `Payment.jsx` - Custom payment form
- ❌ `Payment.css` - Custom payment styles

## 🚀 Benefits of Razorpay Integration

✅ **PCI DSS Compliance** - No need to handle card data  
✅ **Multiple Payment Methods** - Cards, UPI, Net Banking, Wallets  
✅ **Instant Settlements** - Faster payment processing  
✅ **Fraud Protection** - Built-in fraud detection  
✅ **Mobile Optimized** - Responsive payment interface  
✅ **International Support** - Accept global payments  

For detailed implementation guide, see `RAZORPAY_INTEGRATION.md` 📖