import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';

function SellerDashboard() {
  usePageTitle('Seller Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scraps, setScraps] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    availableCount: 0,
    reservedCount: 0,
    soldCount: 0,
    draftCount: 0,
  });
  const [loadingScraps, setLoadingScraps] = useState(false);

  useEffect(() => {
    const loadScraps = async () => {
      setLoadingScraps(true);
      try {
        const res = await api.getMyScraps();
        if (res.success) {
          setScraps(res.scraps || []);
          if (res.stats) {
            setStats(res.stats);
          } else {
            const items = res.scraps || [];
            setStats({
              totalCount: items.length,
              availableCount: items.filter((s) => s.status === 'available').length,
              reservedCount: items.filter((s) => s.status === 'reserved').length,
              soldCount: items.filter((s) => s.status === 'sold').length,
              draftCount: items.filter((s) => s.status === 'draft').length,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load scrap summary:', err.message);
      } finally {
        setLoadingScraps(false);
      }
    };

    loadScraps();
  }, []);

  const area = user?.location?.area;
  const city = user?.location?.city;
  const locationDisplay = area || city ? `${area ? area : ''}${area && city ? ', ' : ''}${city ? city : ''}` : 'Location not set yet';

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

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
              <h3 className="summary-card-title">📦 My Scrap Statistics</h3>
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
              <div className="scrap-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalCount}</div>
                  <div className="stat-label">Total</div>
                </div>

                <div className="stat-card available">
                  <div className="stat-value text-success">{stats.availableCount}</div>
                  <div className="stat-label">Available</div>
                </div>

                <div className="stat-card draft" style={{ background: '#FFFBEB' }}>
                  <div className="stat-value" style={{ color: '#D97706' }}>{stats.draftCount}</div>
                  <div className="stat-label">Drafts</div>
                </div>

                <div className="stat-card reserved">
                  <div className="stat-value text-warning">{stats.reservedCount}</div>
                  <div className="stat-label">Reserved</div>
                </div>

                <div className="stat-card sold">
                  <div className="stat-value text-muted">{stats.soldCount}</div>
                  <div className="stat-label">Sold</div>
                </div>
              </div>
            )}
          </div>

          <div className="placeholder-notice">
            📌 <strong>Seller Overview</strong> — Buyers within your service regions receive instant location notifications when you publish new scrap listings.
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;
