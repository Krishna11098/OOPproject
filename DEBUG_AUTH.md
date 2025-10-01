# Authentication Debug Guide

## 🐛 Debugging the 401 Unauthorized Error

### Step 1: Check if Backend is Running on Port 8000

1. Open terminal and run:
```bash
cd "d:\padhai\oops  Project\OOPproject\backend"
& "D:/padhai/oops  Project/oopproject_env/Scripts/Activate.ps1"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. Verify backend is accessible at: http://localhost:8000/docs

### Step 2: Test Authentication Flow

1. **Check `/me` endpoint first:**
   - Open browser dev tools (F12)
   - Go to Network tab
   - Visit: http://localhost:8000/me
   - Check if you get 401 or user data

2. **Test login manually:**
   - Go to: http://localhost:8000/docs
   - Try the `/login` endpoint
   - Use form data (not JSON)

### Step 3: Frontend Issues

The issue might be in your frontend authentication. Check these:

1. **User not logged in**: The cart endpoint requires authentication
2. **Session cookie not sent**: CORS/credentials issue
3. **Wrong API URL**: Make sure frontend is calling the right backend URL

### Step 4: Quick Fixes

#### Fix 1: Add Better Error Handling in Frontend

```jsx
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
      setCartItems(Array.isArray(cartData) ? cartData : []);
    } else if (response.status === 401) {
      console.log('User not authenticated for cart - this is normal');
      setUser(null); // Clear user state if session expired
      setCartItems([]);
    } else {
      console.error('Failed to load cart with status:', response.status);
      setCartItems([]);
    }
  } catch (error) {
    console.error('Failed to load cart - network error:', error);
    setCartItems([]);
  }
}, [user]); // Add user as dependency
```

#### Fix 2: Update the useEffect in App.jsx

```jsx
// Check if user is logged in on app load
useEffect(() => {
  checkAuthStatus();
}, []);

// Load cart when user changes
useEffect(() => {
  if (user) {
    loadUserCart();
  } else {
    setCartItems([]);
  }
}, [user, loadUserCart]);
```

#### Fix 3: Fix the checkAuthStatus function

```jsx
const checkAuthStatus = async () => {
  try {
    const response = await fetch('http://localhost:8000/me', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const userData = await response.json();
      if (userData.error) {
        // Backend returned error message
        setUser(null);
      } else {
        setUser(userData);
      }
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error('Auth check network error:', error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Backend Session Fix

Make sure your backend session middleware has proper settings:

```python
app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv('SESSION_SECRET', 'secretsuperstar-change-this'),
    max_age=86400,  # 24 hours
    same_site='lax',  # Allow cross-origin
    https_only=False  # Set to True in production
)
```

### Step 6: Test the Complete Flow

1. Start backend on port 8000
2. Start frontend (should be on port 5173)
3. Go to frontend login page
4. Login with valid credentials
5. Check browser dev tools for:
   - Login request success
   - Session cookie being set
   - Cart requests working

### Expected Behavior:

- ✅ User logs in successfully
- ✅ Session cookie is set in browser
- ✅ `/me` endpoint returns user data
- ✅ `/cart/items` works without 401 error

### Common Issues:

1. **Backend not running on port 8000**
2. **User not logged in**
3. **Session expired**
4. **CORS credentials not working**
5. **Database connection issues**