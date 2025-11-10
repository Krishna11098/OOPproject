import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ItemDetail.css';

function ItemDetail({ user, addToCart, isAddingToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdded, setShowAdded] = useState(false);
  const [localAddingToCart, setLocalAddingToCart] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/products/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setError(error.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    console.log('handleAddToCart called - adding 1 item');
    
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }
    
    // Prevent multiple calls during loading
    if (localAddingToCart) {
      console.log('Preventing duplicate call - localAddingToCart:', localAddingToCart);
      return;
    }
    
    try {
      // Set local loading state immediately for instant feedback
      setLocalAddingToCart(true);
      
      // Increment click count for display
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      
      // Use the shared addToCart function from App.jsx (always adds quantity 1)
      const result = await addToCart(product);
      
      if (result && result.success !== false) {
        // Show success feedback with click count
        setShowAdded('added');
        
        // Hide the "Added!" message after 2.5 seconds, but keep click count
        setTimeout(() => {
          setShowAdded(false);
        }, 2500);
        
        // Reset click count after 10 seconds of inactivity
        setTimeout(() => {
          setClickCount(0);
        }, 10000);
        
        console.log('Item added to cart successfully, total clicks:', newClickCount);
      } else {
        // Show error feedback
        setShowAdded('error');
        setClickCount(clickCount); // Revert click count on error
        setTimeout(() => {
          setShowAdded(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setShowAdded('error');
      setClickCount(clickCount); // Revert click count on error
      setTimeout(() => {
        setShowAdded(false);
      }, 3000);
    } finally {
      // Clear local loading state
      setLocalAddingToCart(false);
    }
  };





  if (loading) {
    return (
      <div className="item-detail-container">
        <div className="loading-container">
          <div className="loading-spinner">🌱</div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="item-detail-container">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <Link to="/marketplace" className="back-btn">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="item-detail-container">
      <div className="breadcrumb">
        <Link to="/marketplace">Marketplace</Link>
        <span> › </span>
        <span>{product.category || 'Products'}</span>
        <span> › </span>
        <span>{product.name}</span>
      </div>

      <div className="item-detail-content">
        <div className="item-images">
          <div className="main-image">
            <img 
              src={product.image_url || "/images/default.jpg"} 
              alt={product.name}
              onError={(e) => {
                e.target.src = "/images/default.jpg";
              }}
            />
          </div>
        </div>

        <div className="item-info">
          <div className="item-header">
            <h1>{product.name}</h1>
            <div className="item-meta">
              <span className="category">{product.category || 'Agricultural Product'}</span>
              {product.brand && <span className="brand">By {product.brand}</span>}
            </div>
            
            <div className="rating-section">
              <div className="rating">
                <span className="stars">
                  {'★'.repeat(Math.floor(product.rating || 4))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 4))}
                </span>
                <span className="rating-value">({product.rating || '4.0'})</span>
              </div>
              <span className="review-count">{product.review_count || 0} reviews</span>
            </div>
          </div>

          <div className="price-section">
            <div className="price">₹{product.price}</div>
            <div className="stock-info">
              {product.stock_quantity > 0 ? (
                <span className="in-stock">✓ In Stock ({product.stock_quantity} available)</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{product.title}</p>
            {product.description && <p>{product.description}</p>}
          </div>

          {product.stock_quantity > 0 && (
            <div className="purchase-section">
              <div className="add-to-cart-info">
                <p className="add-info">Each click adds 1 item to your cart</p>
                {clickCount > 0 && (
                  <p className="click-counter">Items added this session: {clickCount}</p>
                )}
              </div>

              <div className="purchase-buttons">
                <button 
                  onClick={handleAddToCart}
                  disabled={localAddingToCart}
                  className={`add-to-cart-btn ${
                    showAdded === 'added' ? 'added' : 
                    showAdded === 'error' ? 'error' : 
                    localAddingToCart ? 'loading' : ''
                  }`}
                >
                  {showAdded === 'added' ? (
                    <span className="success-message">
                      <span className="check-icon">✓</span> Added to Cart! ({clickCount})
                    </span>
                  ) : showAdded === 'error' ? (
                    <span className="error-message">
                      <span className="error-icon">✗</span> Failed to Add
                    </span>
                  ) : localAddingToCart ? (
                    <span className="loading-message">
                      <span className="loading-spinner">⟳</span> Adding to Cart...
                    </span>
                  ) : (
                    <span className="default-message">
                      <span className="cart-icon">🛒</span> Add to Cart - ₹{product.price.toLocaleString()}
                    </span>
                  )}
                </button>
                
                <Link to="/cart" className="view-cart-btn">
                  <span className="cart-icon">🛒</span> View Cart
                </Link>
              </div>
            </div>
          )}

          <div className="product-specifications">
            <h3>Product Information</h3>
            <table className="specs-table">
              <tbody>
                {product.brand && (
                  <tr>
                    <td>Brand</td>
                    <td>{product.brand}</td>
                  </tr>
                )}
                <tr>
                  <td>Category</td>
                  <td>{product.category || 'Agricultural Product'}</td>
                </tr>
                {product.product_type && (
                  <tr>
                    <td>Product Type</td>
                    <td>{product.product_type}</td>
                  </tr>
                )}
                <tr>
                  <td>Stock Available</td>
                  <td>{product.stock_quantity}</td>
                </tr>
                <tr>
                  <td>Price per Unit</td>
                  <td>₹{product.price}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="related-products">
        <h3>Looking for more agricultural products?</h3>
        <Link to="/marketplace" className="view-all-btn">
          Browse All Products →
        </Link>
      </div>
    </div>
  );
}

export default ItemDetail;
