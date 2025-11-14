import { Link } from 'react-router-dom';
import { FaLeaf, FaShoppingCart, FaUserShield } from 'react-icons/fa';
import './Navbar.css';

function Navbar({ user, onLogout, cartItemCount = 0 }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <FaLeaf className="brand-icon" />
          AgriCare
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/upload" className="nav-link">Upload</Link>
          <Link to="/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          <Link to="/announcements" className="nav-link">Announcements</Link>
          
          <div className="auth-section">
            {user ? (
              <div className="user-menu">
                <Link to="/cart" className="cart-link">
                  <FaShoppingCart className="cart-icon" />
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
        
        {/* Admin button in rightmost corner */}
        {user && user.is_admin && (
          <div className="admin-corner">
            <Link to="/admin" className="admin-link">
              <FaUserShield className="admin-icon" />
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;