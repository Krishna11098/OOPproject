import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddressForm from '../components/AddressForm';
import './Cart.css';

function Cart({ user, cartItems, updateQuantity, removeFromCart, onCartSync, onUserLogin }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const navigate = useNavigate();

  // Load cart only when user is present (on mount or user change)
  useEffect(() => {
    console.log('Cart mounted or user changed:', !!user);
    if (user && onCartSync) {
      console.log('Loading cart data...');
      onCartSync();
    }
  }, [user]); // Only depend on user, not onCartSync since it's memoized

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (loadingItems.has(productId)) return;
    
    setLoadingItems(prev => new Set([...prev, productId]));
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    if (removingItems.has(productId)) return;
    
    setRemovingItems(prev => new Set([...prev, productId]));
    try {
      await removeFromCart(productId);
      setShowRemoveConfirm(null);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return Math.round(subtotal * 0.18);
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 500 ? 0 : 50;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + tax + shipping;
  };

  // Demo login function for testing
  const handleDemoLogin = async () => {
    setLoginMessage('Logging in...');
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams({
          username: 'testuser',
          password: 'test123'
        })
      });
      
      if (response.ok) {
        const userData = await response.json();
        onUserLogin(userData); // This should update the user state in App.jsx
        setLoginMessage('✅ Login successful!');
        setTimeout(() => setLoginMessage(''), 3000);
        // Trigger cart sync after login
        if (onCartSync) {
          onCartSync();
        }
      } else {
        setLoginMessage('❌ Login failed!');
        setTimeout(() => setLoginMessage(''), 3000);
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setLoginMessage('❌ Login error!');
      setTimeout(() => setLoginMessage(''), 3000);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      const shouldLogin = window.confirm("You need to login to proceed with checkout. Click OK to login with demo account (testuser).");
      if (shouldLogin) {
        await handleDemoLogin();
        return; // Exit here, user can try checkout again after login
      } else {
        return;
      }
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Show address form instead of direct checkout
    setShowAddressForm(true);
  };

  const handleAddressSubmit = (formattedAddress, addressData) => {
    setShippingAddress(formattedAddress);
    setAddressDetails(addressData);
    setShowAddressForm(false);
    
    // Now proceed with actual checkout
    proceedWithPayment(formattedAddress);
  };

  const proceedWithPayment = async (addressString) => {
    setIsCheckingOut(true);
    
    try {
      // Step 1: Create order in backend
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id || item.product?.id,
        product_name: item.product_name || item.product?.name,
        product_type: item.product_type || item.product?.product_type || 'product',
        price: item.price || item.product?.price,
        quantity: item.quantity
      }));

      // Debug calculations
      const subtotal = calculateSubtotal();
      const tax = calculateTax(subtotal);
      const shipping = calculateShipping(subtotal);
      const total = calculateTotal();
      
      console.log('🧮 Frontend calculations:');
      console.log('  Subtotal:', subtotal);
      console.log('  Tax (18%):', tax);
      console.log('  Shipping:', shipping);
      console.log('  Total:', total);
      console.log('📦 Order items:', orderItems);

      const orderResponse = await fetch('http://localhost:8000/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: orderItems,
          total_amount: calculateTotal(),
          order_type: "cart",
          shipping_address: addressString,
          payment_status: "pending"
        })
      });

      console.log('Order response status:', orderResponse.status);
      console.log('Order response headers:', orderResponse.headers);
      
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Order creation failed:', errorText);
        throw new Error(`Failed to create order: ${orderResponse.status} - ${errorText}`);
      }

      const orderData = await orderResponse.json();
      console.log('Order created:', orderData);

      // Step 2: Create Razorpay order
      const razorpayResponse = await fetch('http://localhost:8000/orders/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          order_id: orderData.order_id
        })
      });

      if (!razorpayResponse.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const razorpayData = await razorpayResponse.json();
      console.log('Razorpay order created:', razorpayData);

      // Step 3: Open Razorpay checkout
      const options = {
        key: razorpayData.key_id,
        amount: razorpayData.razorpay_order.amount,
        currency: razorpayData.razorpay_order.currency || 'INR',
        name: 'Agriculture Marketplace',
        description: 'Order Payment',
        order_id: razorpayData.razorpay_order.id,
        handler: async function (response) {
          try {
            console.log('Payment successful:', response);
            
            const verifyResponse = await fetch('http://localhost:8000/orders/verify-razorpay-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                order_id: orderData.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();
            console.log('Payment verified:', verifyData);

            // Clear cart and redirect to success page
            await onCartSync();
            navigate('/payment/success', {
              state: {
                payment: {
                  payment_id: response.razorpay_payment_id,
                  order_id: orderData.order_id,
                  status: 'success',
                  amount: calculateTotal(),
                  payment_method: 'razorpay'
                },
                order: orderData
              }
            });
            
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
            navigate('/payment/failure', {
              state: {
                error: { message: 'Payment verification failed' },
                order: orderData
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
          color: '#4d7c2d'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setIsCheckingOut(false);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }

    } catch (error) {
      console.error('Checkout failed:', error);
      alert(`Checkout failed: ${error.message}`);
      setIsCheckingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="cart-container">
        <div className="container">
          <div className="auth-required">
            <h2>Please Login</h2>
            <p>You need to be logged in to view your cart</p>
            <Link to="/auth?type=login" className="btn-primary">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any items to your cart yet</p>
            <div className="empty-cart-actions">
              <Link to="/marketplace" className="btn-primary">
                🌱 Start Shopping
              </Link>
              <p className="empty-cart-suggestion">
                Explore our wide range of agricultural products and find what you need!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal();

  return (
    <div className="cart-container">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartItems.length} items in your cart</p>
          {!user && (
            <div style={{ marginTop: '10px' }}>
              <button 
                className="demo-login-btn"
                onClick={handleDemoLogin}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Demo Login (testuser)
              </button>
              {loginMessage && (
                <div style={{ 
                  marginTop: '5px', 
                  padding: '5px 10px', 
                  backgroundColor: loginMessage.includes('✅') ? '#d4edda' : '#f8d7da',
                  color: loginMessage.includes('✅') ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {loginMessage}
                </div>
              )}
            </div>
          )}
          {user && (
            <div style={{ 
              marginTop: '10px', 
              padding: '5px 10px', 
              backgroundColor: '#d1ecf1',
              color: '#0c5460',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              ✅ Logged in as: {user.username}
            </div>
          )}
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => {
              const product = item.product || item;
              const productId = item.product_id || product.id;
              const productName = item.product_name || product.name;
              const productPrice = item.price || product.price;
              const productImage = item.image_url || product.image_url || product.image;

              return (
                <div key={productId} className={`cart-item ${removingItems.has(productId) ? 'removing' : ''}`}>
                  <div className="item-image">
                    <img 
                      src={productImage || "/images/default.jpg"} 
                      alt={productName}
                      onError={(e) => {
                        e.target.src = "/images/default.jpg";
                      }}
                    />
                    <div className="image-overlay">
                      <Link to={`/item/${productId}`} className="view-details-btn">
                        👁️
                      </Link>
                    </div>
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{productName}</h3>
                    <p className="item-description">{item.description || product.description || 'High quality agricultural product'}</p>
                    <span className="item-category">{item.product_type || product.product_type || 'Agricultural Product'}</span>
                  </div>
                  
                  <div className="item-quantity">
                    <label>Quantity</label>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1 || loadingItems.has(productId)}
                      >
                        {loadingItems.has(productId) ? '⏳' : '-'}
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                        className="quantity-btn"
                        disabled={loadingItems.has(productId)}
                      >
                        {loadingItems.has(productId) ? '⏳' : '+'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-price">
                    <div className="unit-price">₹{productPrice} each</div>
                    <div className="total-price">₹{(productPrice * item.quantity).toLocaleString()}</div>
                  </div>
                  
                  <div className="item-actions">
                    {showRemoveConfirm === productId ? (
                      <div className="remove-confirm">
                        <button 
                          onClick={() => handleRemoveItem(productId)}
                          className="confirm-remove-btn"
                          disabled={removingItems.has(productId)}
                        >
                          {removingItems.has(productId) ? '⏳' : '✓'}
                        </button>
                        <button 
                          onClick={() => setShowRemoveConfirm(null)}
                          className="cancel-remove-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowRemoveConfirm(productId)}
                        className="remove-btn"
                        aria-label="Remove item"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Items ({cartItems.length}):</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="summary-row">
                  <span>Tax (18% GST):</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span className={shipping === 0 ? 'free-shipping' : ''}>
                    {shipping === 0 ? (
                      <><span className="free-badge">FREE</span> ₹0</>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="free-shipping-note">
                    💡 Add ₹{(500 - subtotal).toFixed(0)} more for free shipping!
                  </div>
                )}
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total-row">
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`checkout-btn ${isCheckingOut ? 'processing' : ''}`}
              >
                {isCheckingOut ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    Processing...
                  </>
                ) : (
                  `Proceed to Pay ₹${total.toLocaleString()}`
                )}
              </button>
              
              <div className="payment-info">
                <div className="security-badge">
                  <span>🔒</span>
                  <span>Secure payment powered by Razorpay</span>
                </div>
                <div className="payment-methods">
                  <span>💳</span>
                  <span>UPI • Cards • Net Banking • Wallets</span>
                </div>
              </div>
            </div>
            
            <div className="continue-shopping">
              <Link to="/marketplace" className="continue-btn">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>📍 Enter Shipping Address</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowAddressForm(false)}
              >
                ✕
              </button>
            </div>
            <AddressForm 
              onAddressSubmit={handleAddressSubmit}
              initialAddress={addressDetails || {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;