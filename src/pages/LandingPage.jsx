import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';

function LandingPage() {
  usePageTitle('ScrapConnect — Sell Scrap. Find Buyers.');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleSellScrap = () => {
    if (isAuthenticated) {
      if (user?.role === 'seller') {
        navigate('/seller/add-scrap');
      } else {
        navigate('/buyer/dashboard');
      }
    } else {
      navigate('/register?role=seller');
    }
  };

  const handleFindScrap = () => {
    if (isAuthenticated) {
      if (user?.role === 'buyer') {
        navigate('/buyer/browse');
      } else {
        navigate('/seller/dashboard');
      }
    } else {
      navigate('/register?role=buyer');
    }
  };

  return (
    <div className="landing-container">
      {/* Top Header Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="hero-content">
          <div className="hero-badge">♻️ Smart Location-Based Scrap Platform</div>
          <h1 className="hero-heading">
            Sell Scrap Easily. <br />
            <span className="text-highlight">Find Buyers Nearby.</span>
          </h1>
          <p className="hero-subtext">
            Sell scrap easily. Find nearby buyers. Reduce the hassle of scrap collection. Connect with buyers and sellers in your region without waiting for scrap collectors to visit.
          </p>
          <div className="hero-cta-buttons">
            <button className="btn-primary hero-btn" onClick={handleSellScrap}>
              📦 Sell Scrap
            </button>
            <button className="btn-secondary hero-btn" onClick={handleFindScrap}>
              🔍 Find Scrap
            </button>
          </div>
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-label">Direct Buyer Matching</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">Real-Time</span>
              <span className="stat-label">Location Alerts</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">Secure</span>
              <span className="stat-label">Chat & Deals</span>
            </div>
          </div>
        </div>
        <div className="hero-visual-card">
          <div className="visual-card-badge">📍 Automatic Region Match</div>
          <div className="hero-illustration">
            <div className="recycling-icon-lg">♻️</div>
            <div className="illustration-card-preview">
              <div className="preview-img-placeholder">
                <span>📷 Metal & Electronics Scrap</span>
              </div>
              <div className="preview-details">
                <div className="preview-title">Copper & Brass Scrap</div>
                <div className="preview-meta">25 kg • ₹2,500</div>
                <div className="preview-location">📍 Pala, Kottayam</div>
                <div className="preview-status-pill">🔔 Matching Buyers Notified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow: How ScrapConnect Works */}
      <section className="landing-section bg-white">
        <div className="section-header text-center">
          <h2 className="section-title">How ScrapConnect Works</h2>
          <p className="section-sub">A simple 6-step workflow connecting scrap sellers with verified regional buyers.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3 className="step-title">Create Account</h3>
            <p className="step-desc">Sign up easily with your email, phone number, and location details.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3 className="step-title">Choose Your Role</h3>
            <p className="step-desc">Register as a Seller to post scrap, or a Buyer to collect and purchase scrap.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3 className="step-title">Seller Posts Scrap</h3>
            <p className="step-desc">Upload scrap photos, select category, specify weight, price, and location.</p>
          </div>

          <div className="step-card highlight-step">
            <div className="step-number">04</div>
            <h3 className="step-title">Matching Buyers Notified</h3>
            <p className="step-desc">Our location engine alerts only buyers whose service regions match the listing location.</p>
          </div>

          <div className="step-card">
            <div className="step-number">05</div>
            <h3 className="step-title">Chat & Negotiate</h3>
            <p className="step-desc">Discuss details, negotiate price, and send binding price offers directly in real-time chat.</p>
          </div>

          <div className="step-card">
            <div className="step-number">06</div>
            <h3 className="step-title">Complete Deal</h3>
            <p className="step-desc">Accept offer, schedule pickup, complete the deal, and leave seller/buyer reviews.</p>
          </div>
        </div>
      </section>

      {/* Differentiating Feature Highlight: Location-Based Notifications */}
      <section className="landing-section feature-highlight-section">
        <div className="feature-highlight-card">
          <div className="feature-badge">⚡ Core Differentiating Feature</div>
          <h2 className="highlight-title">Location-Based Automatic Buyer Notification</h2>
          <p className="highlight-sub">
            Buyers don't need to manually search the marketplace all day. Buyers set their preferred service regions (towns, districts, pincodes), and ScrapConnect automatically notifies matching buyers the moment new scrap is posted in their area.
          </p>

          <div className="workflow-flowchart">
            <div className="flow-step">
              <div className="flow-icon">📝</div>
              <div className="flow-text">Seller posts scrap</div>
            </div>
            <div className="flow-arrow">➔</div>
            <div className="flow-step">
              <div className="flow-icon">📍</div>
              <div className="flow-text">Location checked</div>
            </div>
            <div className="flow-arrow">➔</div>
            <div className="flow-step">
              <div className="flow-icon">🎯</div>
              <div className="flow-text">Matching buyer regions found</div>
            </div>
            <div className="flow-arrow">➔</div>
            <div className="flow-step highlight-flow-step">
              <div className="flow-icon">🔔</div>
              <div className="flow-text">Only matching buyers notified</div>
            </div>
          </div>
        </div>
      </section>

      {/* For Sellers & For Buyers Split View */}
      <section className="landing-section bg-white">
        <div className="dual-role-grid">
          {/* Seller Card */}
          <div className="role-card seller-role-card">
            <div className="role-card-header">
              <span className="role-icon">♻️</span>
              <h3>For Scrap Sellers</h3>
            </div>
            <p className="role-card-desc">Clear your clutter and earn money without waiting for scrap collectors to visit.</p>
            <ul className="role-features-list">
              <li>✓ Post scrap listings with photos and descriptions in under 2 minutes</li>
              <li>✓ Set your expected price and estimated weight</li>
              <li>✓ Receive instant notifications when buyers express interest</li>
              <li>✓ Negotiate directly via built-in real-time chat</li>
              <li>✓ Schedule convenient pickup times</li>
            </ul>
            <button className="btn-primary btn-full" onClick={() => navigate('/register?role=seller')}>
              Join as Seller →
            </button>
          </div>

          {/* Buyer Card */}
          <div className="role-card buyer-role-card">
            <div className="role-card-header">
              <span className="role-icon">🛒</span>
              <h3>For Scrap Buyers</h3>
            </div>
            <p className="role-card-desc">Source scrap efficiently from verified local sellers within your service areas.</p>
            <ul className="role-features-list">
              <li>✓ Configure multiple service regions (districts, towns, pincodes)</li>
              <li>✓ Receive instant location-filtered alerts when scrap is listed</li>
              <li>✓ Filter by scrap category, weight range, and distance</li>
              <li>✓ Send formal price offers directly through chat</li>
              <li>✓ Build reputation with verified transaction ratings</li>
            </ul>
            <button className="btn-secondary btn-full" onClick={() => navigate('/register?role=buyer')}>
              Join as Buyer →
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Chat & Trust Section */}
      <section className="landing-section">
        <div className="trust-chat-grid">
          <div className="trust-info-block">
            <h2 className="section-title">Built-In Negotiation & Trust</h2>
            <p className="section-sub">
              ScrapConnect provides end-to-end transparency with real-time chat, formal offer cards, deal status tracking, and mutual rating systems.
            </p>
            <div className="trust-badges-row">
              <div className="trust-badge-item">
                <span className="trust-icon">💬</span>
                <div>
                  <strong>Direct Chat</strong>
                  <p>Communicate directly without sharing personal phone numbers upfront.</p>
                </div>
              </div>
              <div className="trust-badge-item">
                <span className="trust-icon">🤝</span>
                <div>
                  <strong>Binding Offer Cards</strong>
                  <p>Send and accept binding price offers with one tap.</p>
                </div>
              </div>
              <div className="trust-badge-item">
                <span className="trust-icon">⭐</span>
                <div>
                  <strong>Ratings & Reviews</strong>
                  <p>View seller and buyer ratings before making deals.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="chat-preview-card">
            <div className="chat-preview-header">
              <span className="preview-avatar">👨‍💼</span>
              <div>
                <div className="preview-name">Rahul (Buyer)</div>
                <div className="preview-status">Online</div>
              </div>
            </div>
            <div className="chat-preview-body">
              <div className="chat-msg left">Is the 25 kg copper scrap still available for pickup in Pala?</div>
              <div className="chat-msg right">Yes! It is ready for pickup anytime today.</div>
              <div className="offer-preview-box">
                <div className="offer-title">Offer Sent: ₹2,400</div>
                <div className="offer-desc">25 kg Copper Scrap</div>
                <button className="btn-success btn-xs" disabled>✓ Offer Accepted</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="landing-cta-section">
        <div className="cta-content">
          <h2 className="cta-heading">Ready to Simplify Scrap Recycling?</h2>
          <p className="cta-sub">Join hundreds of buyers and sellers already connecting on ScrapConnect.</p>
          <div className="cta-buttons">
            <button className="btn-primary btn-lg" onClick={() => navigate('/register')}>
              Create Free Account
            </button>
            <button className="btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Sign In to Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-logo-icon">♻️</span> <strong>ScrapConnect</strong>
            <p className="footer-tagline">Location-Based Scrap Buyer & Seller Platform</p>
          </div>
          <div className="footer-links-row">
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/register?role=seller">Sell Scrap</Link>
            <Link to="/register?role=buyer">Buy Scrap</Link>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} ScrapConnect. All rights reserved. MCA Project.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
