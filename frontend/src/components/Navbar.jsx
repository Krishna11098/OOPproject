import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🌱</span>
          PlantDetector
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <a href="#upload" className="nav-link">Upload</a>
          <a href="#blog" className="nav-link">Blog</a>
          <a href="#market" className="nav-link">Marketplace</a>
          <a href="#announcements" className="nav-link">Announcements</a>
          
          <div className="auth-section">
            {user ? (
              <div className="user-menu">
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