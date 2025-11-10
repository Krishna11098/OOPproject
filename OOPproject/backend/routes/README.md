# Backend Routes Documentation

This document describes the new backend routes for buy now functionality and payment processing.

## Routes Overview

### 1. Order Routes (`/orders`)

#### Create Order
- **POST** `/orders/create`
- Creates a new order for either "buy now" or cart checkout
- **Body**: `CreateOrderRequest`
- **Response**: Order details with order ID

#### Get User Orders
- **GET** `/orders/my-orders`
- Retrieves all orders for the current user
- **Response**: List of user orders

#### Get Order by ID
- **GET** `/orders/{order_id}`
- Retrieves specific order details
- **Response**: Order details

#### Update Order Status
- **PATCH** `/orders/{order_id}/status`
- Updates order status (pending, confirmed, processing, shipped, delivered, cancelled)
- **Body**: `{"status": "confirmed"}`

#### Buy Now Direct
- **POST** `/orders/buynow`
- Creates immediate order for single product
- **Body**: `{"product_id": 1, "quantity": 2}`

### 2. Payment Routes (`/payment`)

#### Process Payment
- **POST** `/payment/process`
- Processes payment for an order
- **Body**: `PaymentRequest` with payment details
- **Response**: Payment confirmation or failure

#### Get Payment Methods
- **GET** `/payment/methods`
- Returns available payment methods and fees
- **Response**: List of payment options

#### Get Payment Status
- **GET** `/payment/status/{payment_id}`
- Checks payment status by payment ID
- **Response**: Payment details and status

#### Get Payment History
- **GET** `/payment/history`
- Returns user's payment history
- **Response**: List of user payments

### 3. Cart Routes (`/cart`)

#### Add to Cart
- **POST** `/cart/add`
- Adds item to user's cart
- **Body**: `{"product_id": 1, "quantity": 2}`

#### Get Cart Items
- **GET** `/cart/items`
- Returns all items in user's cart
- **Response**: List of cart items

#### Update Cart Item
- **PUT** `/cart/update`
- Updates quantity of cart item
- **Body**: `{"product_id": 1, "quantity": 3}`

#### Remove from Cart
- **DELETE** `/cart/remove/{product_id}`
- Removes specific item from cart

#### Clear Cart
- **DELETE** `/cart/clear`
- Removes all items from cart

#### Get Cart Count
- **GET** `/cart/count`
- Returns total number of items in cart

#### Get Cart Total
- **GET** `/cart/total`
- Returns total amount and item count

#### Checkout Cart
- **POST** `/cart/checkout`
- Converts cart to order
- **Body**: `CheckoutRequest`

## Data Models

### OrderItem
```json
{
  "product_id": 1,
  "product_name": "Organic Fertilizer",
  "product_type": "fertilizer",
  "price": 25.99,
  "quantity": 2
}
```

### CreateOrderRequest
```json
{
  "items": [OrderItem],
  "total_amount": 51.98,
  "order_type": "buynow", // or "cart"
  "shipping_address": "123 Farm Road, Agriculture City",
  "payment_method": "pending"
}
```

### PaymentRequest
```json
{
  "order_id": 1,
  "payment_method": "card", // "card", "upi", "netbanking", "wallet"
  "amount": 51.98,
  "card_number": "4111111111111111", // if card payment
  "card_holder_name": "John Farmer",
  "expiry_month": "12",
  "expiry_year": "2025",
  "cvv": "123",
  "billing_address": "123 Farm Road",
  "city": "Agriculture City",
  "state": "Farm State",
  "pincode": "123456"
}
```

## Payment Methods Supported

1. **Credit/Debit Card** - 2.5% + ₹3 fees
2. **UPI** - Free (Google Pay, PhonePe, Paytm, etc.)
3. **Net Banking** - ₹10 fees
4. **Digital Wallet** - 1% + ₹2 fees

## Order Status Flow

1. `pending` - Order created, awaiting payment
2. `confirmed` - Payment successful
3. `processing` - Order being prepared
4. `shipped` - Order shipped
5. `delivered` - Order delivered
6. `cancelled` - Order cancelled

## Authentication

All routes require user authentication via session cookies. Use the existing login system to authenticate users.

## Error Handling

- **400** - Bad Request (validation errors, invalid data)
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (access denied)
- **404** - Not Found (order/payment/product not found)
- **500** - Internal Server Error (payment processing errors)

## Usage Examples

### Buy Now Flow
1. User clicks "Buy Now" on product
2. Frontend calls `POST /orders/buynow` with product details
3. Order created with status "pending"
4. User redirected to payment page
5. Frontend calls `POST /payment/process` with payment details
6. Payment processed, order status updated to "confirmed"

### Cart Checkout Flow
1. User adds items to cart via `POST /cart/add`
2. User views cart via `GET /cart/items`
3. User proceeds to checkout via `POST /cart/checkout`
4. Order created from cart items
5. Cart cleared automatically
6. User completes payment via `POST /payment/process`

## Integration with Main App

These routes are automatically included in the main FastAPI app when the route modules are imported. Make sure to install required dependencies:

```bash
pip install fastapi sqlalchemy pydantic
```

## Testing

Use the provided sample data and test scenarios:
- Test card number `4111111111111111` always succeeds
- Test card number `4000000000000000` always fails
- Other card numbers have random success rates

## Security Notes

- All payment processing is simulated for development
- In production, integrate with real payment gateways
- Store sensitive payment data securely
- Implement proper encryption for card details
- Add rate limiting for payment attempts