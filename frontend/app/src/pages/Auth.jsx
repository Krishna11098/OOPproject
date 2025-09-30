import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Auth.css';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');
    setIsLogin(type !== 'signup');
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
  // Login API call
  const formDataObj = new FormData();
  formDataObj.append('username', formData.username);
  formDataObj.append('password', formData.password);

  const response = await fetch('http://127.0.0.1:8000/login', {
    method: 'POST',
    body: formDataObj,
    credentials: 'include'
  });

  if (response.ok) {
    const userData = await response.json();
    console.log('Login successful:', userData);

    // Directly set user data
    onLogin(userData);
    navigate('/');
  } else {
    const errorData = await response.json();
    setError(errorData.message || 'Login failed');
  }
} else {
        // Signup API call
        const formDataObj = new FormData();
        formDataObj.append('username', formData.username);
        formDataObj.append('email', formData.email);
        formDataObj.append('password', formData.password);

        const response = await fetch('http://127.0.0.1:8000/register', {
          method: 'POST',
          body: formDataObj,
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Signup successful:', userData);
          onLogin(userData);
          navigate('/');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Signup failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const switchMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(`/auth?type=${newMode ? 'login' : 'signup'}`);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to your account' : 'Join our plant community'}</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">Processing...</span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={switchMode} 
              className="switch-btn"
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;