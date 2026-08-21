import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';

function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scraps, setScraps] = useState([]);
  const [loadingScraps, setLoadingScraps] = useState(false);

  useEffect(() => {
    const loadScraps = async () => {
      setLoadingScraps(true);
      try {
        const res = await api.getMyScraps();
        if (res.success) {
          setScraps(res.scraps || []);
        }
      } catch (err) {
        console.error('Failed to load scrap summary:', err.message);
      } finally {
        setLoadingScraps(false);
      }
    };

    loadScraps();
  }, []);

  const totalCount = scraps.length;
  const availableCount = scraps.filter((s) => s.status === 'available').length;
  const reservedCount = scraps.filter((s) => s.status === 'reserved').length;
  const soldCount = scraps.filter((s) => s.status === 'sold').length;

  const area = user?.location?.area;
  const city = user?.location?.city;
  const locationDisplay = area || city ? `${area ? area : ''}${area && city ? ', ' : ''}${city ? city : ''}` : 'Location not set yet';

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <span>♻️</span> ScrapConnect
        </div>
        <div className="user-badge">
          <button className="btn-secondary nav-link-btn" onClick={() => navigate('/seller/scraps')}>
            📦 My Listings
          </button>
          <button className="btn-secondary nav-link-btn" onClick={() => navigate('/seller/add-scrap')}>
            ➕ Add Scrap
          </button>
          <button className="btn-secondary nav-link-btn" onClick={() => navigate('/conversations')}>
            💬 Messages
          </button>
          <NotificationBell />
          <button className="btn-secondary nav-link-btn" onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className="role-tag">Seller ♻️</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Seller Dashboard</h1>
          <p className="welcome-sub">
            Welcome, <strong>{user?.name}</strong>
          </p>

          {/* Location Summary Card */}
          <div className="location-summary-card">
            <div className="location-summary-header">
              <span className="location-summary-icon">📍</span>
              <div>
                <div className="location-summary-label">Primary Location:</div>
                <div className="location-summary-value">{locationDisplay}</div>
              </div>
            </div>
            {(!area && !city) && (
              <button className="btn-link-sm" onClick={() => navigate('/profile')}>
                Update Location →
              </button>
            )}
          </div>

          {/* MY SCRAP LISTINGS SUMMARY CARD */}
          <div className="scrap-summary-card">
            <div className="summary-card-header">
              <h3 className="summary-card-title">📦 My Scrap Summary</h3>
              <div className="summary-card-actions">
                <button className="btn-primary btn-sm" onClick={() => navigate('/seller/add-scrap')}>
                  ➕ Add Scrap
                </button>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/seller/scraps')}>
                  View My Listings
                </button>
              </div>
            </div>

            {loadingScraps ? (
              <div className="summary-loading">Loading scrap statistics...</div>
            ) : (
              <div className="scrap-stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{totalCount}</div>
                  <div className="stat-label">Total Listings</div>
                </div>

                <div className="stat-card available">
                  <div className="stat-value text-success">{availableCount}</div>
                  <div className="stat-label">Available</div>
                </div>

                <div className="stat-card reserved">
                  <div className="stat-value text-warning">{reservedCount}</div>
                  <div className="stat-label">Reserved</div>
                </div>

                <div className="stat-card sold">
                  <div className="stat-value text-muted">{soldCount}</div>
                  <div className="stat-label">Sold</div>
                </div>
              </div>
            )}
          </div>

          <div className="placeholder-notice">
            📌 <strong>Seller Dashboard Notice</strong> — Pickup scheduling, buyer interest, and price negotiations will be enabled in subsequent project steps.
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;
