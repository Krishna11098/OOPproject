import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Blog from './pages/Blog';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import ItemDetail from './pages/ItemDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Define loadUserCart first, before useEffect
  const loadUserCart = useCallback(async () => {
    console.log('loadUserCart called');
    
    // Only load cart if user is logged in
    if (!user) {
      console.log('No user logged in, skipping cart load');
      setCartItems([]);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/cart/items', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const cartData = await response.json();
        console.log('Cart data received:', cartData?.length || 0, 'items');
        // Backend returns array directly
        if (Array.isArray(cartData)) {
          setCartItems(cartData);
        } else {
          setCartItems([]);
        }
      } else if (response.status === 401) {
        // User not authenticated - clear user state if session expired
        console.log('Session expired, clearing user state');
        setUser(null);
        setCartItems([]);
      } else {
        console.error('Failed to load cart with status:', response.status);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to load cart - network error:', error);
      // Continue without cart data
      setCartItems([]);
    }
  }, [user]); // Add user as dependency

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/me', {
        credentials: 'include' // Important for cookies/sessions
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log(userData);
        if (userData.error) {
          // Backend returned error message (like "Not authenticated")
          // setUser(null);
        } else {
          setUser(userData);
        }
      } else if (response.status === 401) {
        // User not authenticated - this is normal, don't log as error
        // setUser(null);
      } else {
        console.error('Auth check failed with status:', response.status);
        // setUser(null);
      }
    } catch (error) {
      console.error('Auth check network error:', error);
      // setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load cart when user state changes
  useEffect(() => {
    if (user) {
      loadUserCart();
    } else {
      setCartItems([]);
    }
  }, [user, loadUserCart]);

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
    // Cart will be loaded automatically by the useEffect that watches user state
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setCartItems([]); // Clear cart on logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      setUser(null);
      setCartItems([]);
    }
  };

  const addToCart = async (item) => {
    if (!user) {
      return { success: false, message: "Please login to add items to cart" };
    }

    if (isAddingToCart) {
      return { success: false, message: "Operation in progress" };
    }

    try {
      setIsAddingToCart(true);
      
      // Always add 1 more item to cart (increment quantity if exists)
      const response = await fetch('http://localhost:8000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ product_id: item.id, quantity: 1 })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to add to cart');
      }
      
      const result = await response.json();
      
      // Immediately update local cart state for instant UI feedback
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(cartItem => 
          (cartItem.product_id || cartItem.id) === item.id
        );
        
        if (existingItemIndex >= 0) {
          // Increment quantity of existing item
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
          };
          return updatedItems;
        } else {
          // Add new item with quantity 1
          return [...prevItems, {
            product_id: item.id,
            product_name: item.name,
            product_type: item.product_type || 'product',
            price: item.price,
            quantity: 1,
            image_url: item.image_url
          }];
        }
      });
      
      // Also reload from backend to ensure consistency (but don't wait for it)
      loadUserCart().catch(console.error);
      
      return { success: true, action: 'added', message: result.message || 'Item added to cart' };
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return { 
        success: false, 
        action: 'error',
        message: error.message || 'Failed to add item to cart' 
      };
    } finally {
      setIsAddingToCart(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8000/cart/remove/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      // Reload cart from backend to ensure consistency
      loadUserCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      alert(error.message || 'Failed to remove item from cart');
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ product_id: itemId, quantity: quantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      setCartItems(prevItems => 
        prevItems.map(item => 
          (item.id === itemId || item.product_id === itemId) 
            ? { ...item, quantity } 
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      // Still update UI even if backend call fails
      setCartItems(prevItems => 
        prevItems.map(item => 
          (item.id === itemId || item.product_id === itemId) 
            ? { ...item, quantity } 
            : item
        )
      );
    }
  };

  const syncCart = useCallback(async () => {
    console.log('syncCart called');
    // Reload cart from backend to ensure real-time sync
    await loadUserCart();
  }, [loadUserCart]); // Now depends on memoized loadUserCart

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🌱</div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} cartItemCount={cartItems.length} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
          <Route path="/blog" element={<Blog user={user}/>} />
          <Route path="/marketplace" element={<Marketplace user={user} addToCart={addToCart} isAddingToCart={isAddingToCart} />} />
          <Route path="/cart" element={<Cart user={user} cartItems={cartItems} updateQuantity={updateCartQuantity} removeFromCart={removeFromCart} onCartSync={syncCart} onUserLogin={setUser} />} />
          <Route path="/item/:id" element={<ItemDetail user={user} addToCart={addToCart} isAddingToCart={isAddingToCart} />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
