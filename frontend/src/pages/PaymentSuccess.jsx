import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Get payment and order data from location state
    const { payment, order } = location.state || {};
    
    if (!payment || !order) {
      // If no payment data, redirect to marketplace
      navigate('/marketplace');
      return;
    }

    setPaymentDetails(payment);
    setOrderDetails(order);
  }, [location.state, navigate]);

  const handleContinueShopping = () => {
    navigate('/marketplace');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleDownloadInvoice = () => {
    // Implement invoice download functionality
    alert('Invoice download feature will be implemented soon!');
  };

  if (!orderDetails || !paymentDetails) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🌱</div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="payment-success-content">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <div className="checkmark">
              <div className="checkmark-circle">
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
          </div>
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Thank you for your order. Your payment has been processed successfully.
          </p>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="order-info-grid">
            <div className="order-info-item">
              <label>Order ID:</label>
              <span className="order-id">#{orderDetails.id}</span>
            </div>
            <div className="order-info-item">
              <label>Payment ID:</label>
              <span>{paymentDetails.payment_id}</span>
            </div>
            <div className="order-info-item">
              <label>Order Date:</label>
              <span>{new Date(orderDetails.created_at).toLocaleDateString()}</span>
            </div>
            <div className="order-info-item">
              <label>Payment Method:</label>
              <span className="payment-method">
                {paymentDetails.payment_method.toUpperCase()}
              </span>
            </div>
            <div className="order-info-item">
              <label>Transaction ID:</label>
              <span>{paymentDetails.gateway_response.transaction_id}</span>
            </div>
            <div className="order-info-item total">
              <label>Total Amount:</label>
              <span className="amount">₹{orderDetails.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Items Ordered */}
        <div className="items-section">
          <h3>Items Ordered</h3>
          <div className="items-list">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <h4>{item.product_name}</h4>
                  <p className="item-type">{item.product_type}</p>
                </div>
                <div className="item-quantity">
                  Qty: {item.quantity}
                </div>
                <div className="item-price">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="delivery-section">
          <h3>Delivery Information</h3>
          <div className="delivery-info">
            <div className="delivery-address">
              <strong>Shipping Address:</strong>
              <p>{orderDetails.shipping_address || "Address will be collected during delivery"}</p>
            </div>
            <div className="delivery-estimate">
              <strong>Estimated Delivery:</strong>
              <p>3-5 business days</p>
            </div>
            <div className="order-status">
              <strong>Current Status:</strong>
              <span className="status-badge confirmed">
                {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps-section">
          <h3>What's Next?</h3>
          <div className="steps-list">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Order Confirmation</h4>
                <p>You'll receive an email confirmation with order details</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Processing</h4>
                <p>Your order will be processed and prepared for shipping</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Shipping</h4>
                <p>You'll receive tracking details once your order is shipped</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleDownloadInvoice}
            className="btn-secondary"
          >
            📄 Download Invoice
          </button>
          <button 
            onClick={handleViewOrders}
            className="btn-secondary"
          >
            📦 View All Orders
          </button>
          <button 
            onClick={handleContinueShopping}
            className="btn-primary"
          >
            🛒 Continue Shopping
          </button>
        </div>

        {/* Support Information */}
        <div className="support-section">
          <h4>Need Help?</h4>
          <p>
            If you have any questions about your order, please contact our support team:
          </p>
          <div className="support-contacts">
            <div className="contact-item">
              <strong>Email:</strong> support@agrimarket.com
            </div>
            <div className="contact-item">
              <strong>Phone:</strong> +91 9876543210
            </div>
            <div className="contact-item">
              <strong>Hours:</strong> Mon-Sat 9AM-6PM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;