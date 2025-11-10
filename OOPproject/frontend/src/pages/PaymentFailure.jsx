import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentFailure.css';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Get payment error and order data from location state
    const { error, order, retryAttempts } = location.state || {};
    
    if (!error && !order) {
      // If no error data, redirect to marketplace
      navigate('/marketplace');
      return;
    }

    setPaymentError(error);
    setOrderDetails(order);
    setRetryCount(retryAttempts || 0);
  }, [location.state, navigate]);

  const handleRetryPayment = () => {
    if (orderDetails) {
      // Navigate back to payment page with order details
      navigate('/payment', { 
        state: { 
          ...orderDetails, 
          retryAttempt: retryCount + 1 
        } 
      });
    }
  };

  const handleChooseDifferentMethod = () => {
    if (orderDetails) {
      // Navigate to payment page with flag to show different methods
      navigate('/payment', { 
        state: { 
          ...orderDetails, 
          showAlternativeMethods: true 
        } 
      });
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    navigate('/marketplace');
  };

  const handleContactSupport = () => {
    // Open support chat or redirect to support page
    window.open('mailto:support@agrimarket.com?subject=Payment Issue - Order ' + (orderDetails?.id || 'Unknown'));
  };

  const getErrorMessage = () => {
    if (!paymentError) return "Payment could not be processed";
    
    switch (paymentError.type) {
      case 'card_declined':
        return "Your card was declined. Please check your card details or try a different card.";
      case 'insufficient_funds':
        return "Insufficient funds in your account. Please check your balance or use a different payment method.";
      case 'network_error':
        return "Network connection failed. Please check your internet connection and try again.";
      case 'upi_failed':
        return "UPI payment failed. Please try again or use a different payment method.";
      case 'bank_error':
        return "Bank server is temporarily unavailable. Please try again later.";
      default:
        return paymentError.message || "Payment processing failed. Please try again.";
    }
  };

  const getSuggestedActions = () => {
    if (!paymentError) return [];
    
    switch (paymentError.type) {
      case 'card_declined':
        return [
          "Check if your card details are correct",
          "Ensure your card has sufficient balance",
          "Try using a different card",
          "Contact your bank if the issue persists"
        ];
      case 'insufficient_funds':
        return [
          "Check your account balance",
          "Use a different payment method",
          "Try a different card with sufficient funds"
        ];
      case 'network_error':
        return [
          "Check your internet connection",
          "Try refreshing the page",
          "Switch to a more stable network"
        ];
      case 'upi_failed':
        return [
          "Check your UPI PIN",
          "Ensure your UPI app is working",
          "Try using net banking instead",
          "Use card payment as alternative"
        ];
      default:
        return [
          "Try again after a few minutes",
          "Use a different payment method",
          "Contact support if the issue continues"
        ];
    }
  };

  if (!paymentError && !orderDetails) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🌱</div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="payment-failure-container">
      <div className="payment-failure-content">
        {/* Failure Header */}
        <div className="failure-header">
          <div className="failure-icon">
            <div className="error-circle">
              <div className="error-cross">
                <div className="cross-line1"></div>
                <div className="cross-line2"></div>
              </div>
            </div>
          </div>
          <h1>Payment Failed</h1>
          <p className="failure-message">
            {getErrorMessage()}
          </p>
        </div>

        {/* Order Information */}
        {orderDetails && (
          <div className="order-info-section">
            <h2>Order Information</h2>
            <div className="order-details-grid">
              <div className="order-detail-item">
                <label>Order ID:</label>
                <span>#{orderDetails.id}</span>
              </div>
              <div className="order-detail-item">
                <label>Total Amount:</label>
                <span className="amount">₹{orderDetails.total_amount}</span>
              </div>
              <div className="order-detail-item">
                <label>Items:</label>
                <span>{orderDetails.items?.length || 0} item(s)</span>
              </div>
              <div className="order-detail-item">
                <label>Order Type:</label>
                <span>{orderDetails.order_type}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Details */}
        {paymentError && (
          <div className="error-details-section">
            <h3>Error Details</h3>
            <div className="error-info">
              <div className="error-code">
                <strong>Error Code:</strong> {paymentError.code || 'PAYMENT_FAILED'}
              </div>
              {paymentError.gateway_response && (
                <div className="gateway-response">
                  <strong>Gateway Response:</strong> {paymentError.gateway_response}
                </div>
              )}
              <div className="failure-time">
                <strong>Failed At:</strong> {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        <div className="suggestions-section">
          <h3>What can you do?</h3>
          <div className="suggestions-list">
            {getSuggestedActions().map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <div className="suggestion-bullet">•</div>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Payment Methods */}
        <div className="alternatives-section">
          <h3>Try Different Payment Methods</h3>
          <div className="payment-methods-grid">
            <div className="payment-method-option">
              <div className="method-icon">💳</div>
              <div className="method-info">
                <h4>Credit/Debit Card</h4>
                <p>Visa, MasterCard, RuPay</p>
              </div>
            </div>
            <div className="payment-method-option">
              <div className="method-icon">📱</div>
              <div className="method-info">
                <h4>UPI Payment</h4>
                <p>Google Pay, PhonePe, Paytm</p>
              </div>
            </div>
            <div className="payment-method-option">
              <div className="method-icon">🏦</div>
              <div className="method-info">
                <h4>Net Banking</h4>
                <p>All major banks supported</p>
              </div>
            </div>
            <div className="payment-method-option">
              <div className="method-icon">💰</div>
              <div className="method-info">
                <h4>Digital Wallet</h4>
                <p>Paytm, Amazon Pay, etc.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleRetryPayment}
            className="btn-primary"
            disabled={!orderDetails}
          >
            🔄 Retry Payment
          </button>
          <button 
            onClick={handleChooseDifferentMethod}
            className="btn-secondary"
            disabled={!orderDetails}
          >
            💳 Try Different Method
          </button>
          <button 
            onClick={handleBackToCart}
            className="btn-secondary"
          >
            🛒 Back to Cart
          </button>
          <button 
            onClick={handleContinueShopping}
            className="btn-outline"
          >
            🏠 Continue Shopping
          </button>
        </div>

        {/* Support Section */}
        <div className="support-section">
          <h4>Still having trouble?</h4>
          <p>Our support team is here to help you complete your purchase.</p>
          <div className="support-actions">
            <button 
              onClick={handleContactSupport}
              className="support-btn"
            >
              📧 Contact Support
            </button>
            <div className="support-info">
              <div className="support-contact">
                <strong>Phone:</strong> +91 9876543210
              </div>
              <div className="support-contact">
                <strong>Hours:</strong> 24/7 Support Available
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="security-note">
          <div className="security-icon">🔒</div>
          <div className="security-text">
            <strong>Your payment information is secure.</strong>
            <p>We don't store your card details and all transactions are encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;