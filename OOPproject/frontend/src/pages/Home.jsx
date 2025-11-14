import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { FaCamera, FaBrain, FaChartLine, FaLightbulb, FaLeaf, FaCheckCircle, FaMicroscope } from 'react-icons/fa';
import './Home.css';

function AnimatedSphere() {
  return (
    <Sphere visible args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color="#2d5016"
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  );
}

function Home({ user }) {
  return (
    <div className="home-container">
      {/* Hero Section with 3D Background */}
      <section className="home-hero-section">
        <div className="home-hero-3d-bg">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <AnimatedSphere />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>
        
        <div className="home-hero-overlay"></div>
        
        <div className="home-hero-content">
          <div className="home-hero-text">
            <h1 className="home-hero-title">
              Detect Plant Diseases <span className="home-highlight">in Seconds</span>
            </h1>
            
            {user && (
              <div className="home-welcome-banner">
                <FaLeaf className="home-welcome-icon" />
                <div>
                  <h3>Welcome back, {user.username}!</h3>
                  <p>Ready to check your plants' health?</p>
                </div>
              </div>
            )}
            
            <p className="home-hero-description">
              Upload a photo of your plant and get instant AI-powered analysis 
              to identify diseases and receive treatment recommendations. 
              Join thousands of gardeners and farmers protecting their crops.
            </p>
            
            <div className="home-hero-buttons">
              {user ? (
                <a href="#upload" className="home-btn-primary">
                  <FaCamera /> Upload Plant Image
                </a>
              ) : (
                <>
                  <Link to="/auth?type=signup" className="home-btn-primary">
                    <FaLeaf /> Get Started Free
                  </Link>
                  <Link to="/auth?type=login" className="home-btn-secondary">
                    Login
                  </Link>
                </>
              )}
            </div>
            
            <div className="home-hero-stats">
              <div className="home-stat">
                <FaMicroscope className="home-stat-icon" />
                <h3>10,000+</h3>
                <p>Plants Analyzed</p>
              </div>
              <div className="home-stat">
                <FaCheckCircle className="home-stat-icon" />
                <h3>95%</h3>
                <p>Accuracy Rate</p>
              </div>
              <div className="home-stat">
                <FaLeaf className="home-stat-icon" />
                <h3>50+</h3>
                <p>Diseases Detected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features-section">
        <div className="home-container">
          <h2 className="home-section-title">How It Works</h2>
          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <FaCamera />
              </div>
              <h3>Upload Image</h3>
              <p>Take a clear photo of your plant's leaves, stems, or fruits</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <FaBrain />
              </div>
              <h3>AI Analysis</h3>
              <p>Our advanced neural network analyzes the image in seconds</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <FaChartLine />
              </div>
              <h3>Get Results</h3>
              <p>Receive detailed diagnosis with confidence scores</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <FaLightbulb />
              </div>
              <h3>Take Action</h3>
              <p>Follow expert treatment recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta-section">
        <div className="home-container">
          <div className="home-cta-content">
            <h2>Start Protecting Your Plants Today</h2>
            <p>Join our community of plant lovers and professionals</p>
            <div className="home-cta-buttons">
              {user ? (
                <a href="#upload" className="home-btn-primary home-large">
                  <FaLeaf /> Analyze Plants
                </a>
              ) : (
                <Link to="/auth?type=signup" className="home-btn-primary home-large">
                  <FaLeaf /> Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-content">
            <div className="home-footer-brand">
              <h3><FaLeaf /> AgriCare</h3>
              <p>Your trusted partner in plant health</p>
            </div>
            <div className="home-footer-links">
              <div className="home-link-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#api">API</a>
              </div>
              <div className="home-link-group">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#blog">Blog</a>
                <a href="#careers">Careers</a>
              </div>
              <div className="home-link-group">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#privacy">Privacy</a>
              </div>
            </div>
          </div>
          <div className="home-footer-bottom">
            <p>&copy; 2024 AgriCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;