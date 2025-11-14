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

  // Read ?type=signup from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');
    setIsLogin(type !== 'signup');
  }, [location]);

  // ------------------------------
  // VALIDATION FUNCTION
  // ------------------------------
  const validateSignup = () => {
    const { email, password } = formData;

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (!email.includes("@")) {
      setError("Email must contain @");
      return false;
    }
    if (!email.endsWith(".com")) {
      setError("Email must end with .com");
      return false;
    }

    return true;
  };

  // ------------------------------
  // SUBMIT HANDLER
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Run validation only for SIGNUP
    if (!isLogin) {
      const valid = validateSignup();
      if (!valid) return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('username', formData.username);
      formDataObj.append('password', formData.password);

      if (!isLogin) {
        formDataObj.append('email', formData.email);
      }

      const url = isLogin
        ? 'http://localhost:8000/login'
        : 'http://localhost:8000/register';

      const response = await fetch(url, {
        method: 'POST',
        body: formDataObj,
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        onLogin(result);
        navigate('/');
      } else {
        setError(result.message || (isLogin ? 'Login failed' : 'Signup failed'));
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  // ------------------------------
  // HANDLE INPUT CHANGE
  // ------------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ------------------------------
  // SWITCH LOGIN <-> SIGNUP
  // ------------------------------
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

        {error && <div className="error-message">{error}</div>}

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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="switch-btn" onClick={switchMode} disabled={loading}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
