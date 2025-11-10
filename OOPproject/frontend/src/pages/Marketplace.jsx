import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Marketplace.css';

function Marketplace({ user, addToCart, isAddingToCart }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(new Set()); // Track which products are being added
  const [addedToCart, setAddedToCart] = useState(new Set()); // Track which products were just added

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter and sort products when dependencies change
  useEffect(() => {
    filterAndSortProducts();
  }, [selectedCategory, searchTerm, sortBy, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('http://localhost:8000/products', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Please login to view products");
          return;
        }
        throw new Error(`Failed to load products: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend returns {products: [...], total: n}, so extract the products array
      const productsData = data.products || [];
      
      // Check if productsData is an array
      if (!Array.isArray(productsData)) {
        console.error("Products data is not an array:", productsData);
        setError("Invalid products data received");
        return;
      }
      
      // Transform backend data to match frontend expectations
      const transformedProducts = productsData.map(product => ({
        ...product,
        in_stock: product.stock_quantity > 0, // Add in_stock property based on stock_quantity
        image: product.image_url // Ensure image property exists
      }));
      
      setProducts(transformedProducts);
      
      // Extract unique categories from products
      const uniqueCategories = ["All", ...new Set(transformedProducts.map(product => product.category))];
      setCategories(uniqueCategories);
      
    } catch (err) {
      setError(err.message || "Failed to load products");
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    // Check if products is an array
    if (!Array.isArray(products)) {
      console.error("Products is not an array:", products);
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products]; // Create a copy to avoid mutating original array

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    // Prevent multiple clicks on the same product
    if (addingToCart.has(product.id)) {
      return;
    }

    try {
      // Set loading state for this specific product
      setAddingToCart(prev => new Set([...prev, product.id]));
      
      // Use the shared addToCart function from App.jsx for proper synchronization
      const result = await addToCart(product);
      
      if (result && result.success !== false) {
        // Show success state for this product
        setAddedToCart(prev => new Set([...prev, product.id]));
        
        // Reset to original state after 2.5 seconds
        setTimeout(() => {
          setAddedToCart(prev => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
        }, 2500);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      // Clear loading state for this product
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  return (
    <div className="marketplace-container">
      {/* Hero Section */}
      <section className="marketplace-hero">
        <div className="hero-content">
          <h1>Agriculture Marketplace</h1>
          <p>Find everything you need for healthy plants and productive farming</p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="container">
            <div className="loading-spinner">🌱</div>
            <p>Loading products...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-section">
          <div className="container">
            <div className="error-message">
              <h3>Error Loading Products</h3>
              <p>{error}</p>
              <button onClick={loadProducts} className="retry-btn">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {!loading && !error && (
        <>
          <section className="marketplace-filters">
            <div className="container">
              <div className="filters-row">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                <div className="filter-group">
                  <label>Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="products-section">
            <div className="container">
              <div className="products-header">
                <h2>Products ({filteredProducts.length})</h2>
              </div>

              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <Link to={`/item/${product.id}`} className="product-link">
                      <div className="product-image">
                        <img 
                          src={product.image_url || product.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'} 
                          alt={product.name} 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                          }}
                        />
                        {!product.in_stock && <div className="out-of-stock">Out of Stock</div>}
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-rating">
                          <span className="stars">{'★'.repeat(Math.floor(product.rating || 4))}</span>
                          <span className="rating-text">{product.rating || '4.0'} ({product.reviews || '0'} reviews)</span>
                        </div>
                        <div className="product-price">₹{product.price}</div>
                      </div>
                    </Link>
                    <div className="product-actions">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.in_stock || addingToCart.has(product.id)}
                        className={`add-to-cart-btn ${
                          addedToCart.has(product.id) ? 'added' : 
                          addingToCart.has(product.id) ? 'loading' : ''
                        }`}
                        data-product-id={product.id}
                      >
                        {addedToCart.has(product.id) ? (
                          <span>
                            <span className="check-icon">✓</span> Added to Cart!
                          </span>
                        ) : addingToCart.has(product.id) ? (
                          <span>
                            <span className="loading-spinner">⟳</span> Adding...
                          </span>
                        ) : (
                          product.in_stock ? "Add to Cart" : "Out of Stock"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && !loading && (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Marketplace;