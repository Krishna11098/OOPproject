import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout, cartItemCount = 0 }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🌱</span>
          PlantDetector
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <a href="/upload" className="nav-link">Upload</a>
          <Link to="/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          <Link to="/announcements" className="nav-link">Announcements</Link>
          
          <div className="auth-section">
            {user ? (
              <div className="user-menu">
                <Link to="/cart" className="cart-link">
                  <span className="cart-icon">🛒</span>
                  {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                </Link>
                <span className="welcome-text">Welcome, {user.username}</span>
                <button onClick={onLogout} className="btn-logout">Logout</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/auth?type=login" className="btn-login">Login</Link>
                <Link to="/auth?type=signup" className="btn-signup">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;