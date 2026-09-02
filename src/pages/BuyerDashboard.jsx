import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';

function BuyerDashboard() {
  usePageTitle('Buyer Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [regions, setRegions] = useState(user?.serviceRegions || []);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [availableCount, setAvailableCount] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoadingRegions(true);
      try {
        const [regionsRes, scrapsRes, notifRes] = await Promise.all([
          api.getServiceRegions(),
          api.getMarketplaceScraps({ limit: 1 }),
          api.getUnreadNotificationCount(),
        ]);

        if (regionsRes.success) {
          setRegions(regionsRes.data || regionsRes.serviceRegions || []);
        }
        if (scrapsRes.success) {
          setAvailableCount(scrapsRes.pagination?.total ?? scrapsRes.totalListings ?? 0);
        }
        if (notifRes.success) {
          setUnreadNotifCount(notifRes.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoadingRegions(false);
      }
    };

    loadData();
  }, []);

  const area = user?.location?.area;
  const city = user?.location?.city;
  const locationDisplay = area || city ? `${area ? area : ''}${area && city ? ', ' : ''}${city ? city : ''}` : 'Location not set yet';

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Buyer Dashboard</h1>
          <p className="welcome-sub">
            Welcome, <strong>{user?.name}</strong>
          </p>

          {/* Location Bar */}
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

          {/* BUYER DASHBOARD SUMMARY CARDS GRID */}
          <div className="buyer-dashboard-grid">
            {/* 1. Available Scrap Marketplace Card */}
            <div className="buyer-summary-card highlight-card">
              <div className="summary-card-header">
                <div>
                  <h3 className="summary-card-title">Available Scrap Marketplace</h3>
                  <p className="summary-card-sub">Browse items listed by local scrap sellers</p>
                </div>
              </div>
              <div className="summary-card-body">
                <div className="summary-stat-large">
                  {availableCount !== null ? `${availableCount} Listings` : 'Explore Listings'}
                </div>
                <button className="btn-primary btn-full" onClick={() => navigate('/buyer/browse')}>
                  🔍 Browse Scrap
                </button>
              </div>
            </div>

            {/* 2. My Service Regions Card */}
            <div className="buyer-summary-card">
              <div className="summary-card-header">
                <div>
                  <h3 className="summary-card-title">My Service Regions</h3>
                  <p className="summary-card-sub">Your operating scrap collection areas</p>
                </div>
                <span className="summary-count-badge">
                  {loadingRegions ? '...' : `${regions.length} ${regions.length === 1 ? 'Region' : 'Regions'}`}
                </span>
              </div>
              <div className="summary-card-body">
                {regions.length > 0 ? (
                  <ul className="summary-regions-list">
                    {regions.slice(0, 4).map((reg) => (
                      <li key={reg._id} className="summary-region-item">
                        <span className="bullet-dot">🟢</span>
                        <strong>{reg.area ? `${reg.area}, ` : ''}{reg.city || reg.district}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="summary-empty">No service regions added yet.</div>
                )}
                <button
                  className="btn-secondary btn-full"
                  onClick={() => navigate('/buyer/service-regions')}
                  style={{ marginTop: '1rem' }}
                >
                  Manage Service Regions
                </button>
              </div>
            </div>

            {/* 3. Notifications Summary Card */}
            <div className="buyer-summary-card">
              <div className="summary-card-header">
                <div>
                  <h3 className="summary-card-title">Scrap Alerts</h3>
                  <p className="summary-card-sub">Nearby matching scrap listings</p>
                </div>
                {unreadNotifCount > 0 && <span className="status-badge available">{unreadNotifCount} UNREAD</span>}
              </div>
              <div className="summary-card-body">
                <div className="summary-stat-large" style={{ fontSize: '1.25rem' }}>
                  {unreadNotifCount > 0
                    ? `🔔 ${unreadNotifCount} new alert${unreadNotifCount > 1 ? 's' : ''}`
                    : '🔔 No unread alerts'}
                </div>
                <button
                  className="btn-secondary btn-full"
                  onClick={() => navigate('/notifications')}
                  style={{ marginTop: '1rem' }}
                >
                  View Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BuyerDashboard;
