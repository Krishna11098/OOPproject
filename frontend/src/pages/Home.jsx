import { Link } from 'react-router-dom';
import './Home.css';

function Home({ user }) {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Detect Plant Diseases <span className="highlight">in Seconds</span>
            </h1>
            
            {user && (
              <div className="welcome-banner">
                <h3>Welcome back, {user.username}! 🌿</h3>
                <p>Ready to check your plants' health?</p>
              </div>
            )}
            
            <p className="hero-description">
              Upload a photo of your plant and get instant AI-powered analysis 
              to identify diseases and receive treatment recommendations. 
              Join thousands of gardeners and farmers protecting their crops.
            </p>
            
            <div className="hero-buttons">
              {user ? (
                <a href="#upload" className="btn-primary">Upload Plant Image</a>
              ) : (
                <>
                  <Link to="/auth?type=signup" className="btn-primary">Get Started Free</Link>
                  <Link to="/auth?type=login" className="btn-secondary">Login</Link>
                </>
              )}
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <h3>10,000+</h3>
                <p>Plants Analyzed</p>
              </div>
              <div className="stat">
                <h3>95%</h3>
                <p>Accuracy Rate</p>
              </div>
              <div className="stat">
                <h3>50+</h3>
                <p>Diseases Detected</p>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-card">
              <div className="plant-image"></div>
              <div className="scan-effect"></div>
            </div>
          </div>
        </div>
        
        <div className="wave-divider">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Upload Image</h3>
              <p>Take a clear photo of your plant's leaves, stems, or fruits</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Analysis</h3>
              <p>Our advanced neural network analyzes the image in seconds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Get Results</h3>
              <p>Receive detailed diagnosis with confidence scores</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Take Action</h3>
              <p>Follow expert treatment recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Start Protecting Your Plants Today</h2>
            <p>Join our community of plant lovers and professionals</p>
            <div className="cta-buttons">
              {user ? (
                <a href="#upload" className="btn-primary large">Analyze Plants</a>
              ) : (
                <Link to="/auth?type=signup" className="btn-primary large">Sign Up Free</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>🌱 PlantDetector</h3>
              <p>Your trusted partner in plant health</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#api">API</a>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#blog">Blog</a>
                <a href="#careers">Careers</a>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#privacy">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 PlantDetector. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;