import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function BuyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [regions, setRegions] = useState(user?.serviceRegions || []);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    const loadRegions = async () => {
      setLoadingRegions(true);
      try {
        const res = await api.getServiceRegions();
        if (res.success) {
          setRegions(res.serviceRegions || []);
        }
      } catch (err) {
        console.error('Failed to load regions summary:', err.message);
      } finally {
        setLoadingRegions(false);
      }
    };

    loadRegions();
  }, []);

  const area = user?.location?.area;
  const city = user?.location?.city;
  const locationDisplay = area || city ? `${area ? area : ''}${area && city ? ', ' : ''}${city ? city : ''}` : 'Location not set yet';

  return (
    <div className="dashboard-container">
      <header className="navbar">
        <div className="navbar-brand">
          <span>♻️</span> ScrapConnect
        </div>
        <div className="user-badge">
          <button className="btn-secondary nav-link-btn" onClick={() => navigate('/buyer/service-regions')}>
            📍 My Service Regions
          </button>
          <button className="btn-secondary nav-link-btn" onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className="role-tag" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              Buyer 🛒
            </span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Buyer Dashboard</h1>
          <p className="welcome-sub">
            Welcome, <strong>{user?.name}</strong>
          </p>

          {/* Primary Profile Location */}
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

          {/* SERVICE REGIONS SUMMARY CARD */}
          <div className="service-regions-summary-card">
            <div className="summary-card-header">
              <div>
                <h3 className="summary-card-title">Service Regions</h3>
                <span className="summary-count-badge">
                  {loadingRegions ? '...' : `${regions.length} ${regions.length === 1 ? 'Area' : 'Areas'}`}
                </span>
              </div>
              <button className="btn-primary btn-sm" onClick={() => navigate('/buyer/service-regions')}>
                Manage Regions
              </button>
            </div>

            {loadingRegions ? (
              <div className="summary-loading">Loading service regions...</div>
            ) : regions.length > 0 ? (
              <ul className="summary-regions-list">
                {regions.map((reg) => (
                  <li key={reg._id} className="summary-region-item">
                    <span className="bullet-dot">🟢</span>
                    <strong>{reg.area ? `${reg.area}, ` : ''}{reg.city}</strong>
                    <span className="summary-region-sub">({reg.district}, {reg.state})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="summary-empty">
                You haven't specified any scrap collection service regions yet.
                <br />
                <button className="btn-link-sm" onClick={() => navigate('/buyer/service-regions')}>
                  + Add Service Regions
                </button>
              </div>
            )}
          </div>

          <div className="placeholder-notice">
            📌 <strong>Buyer Dashboard Placeholder</strong> — Service area matching, scrap pickup requests, and buyer bidding will be implemented in subsequent project steps.
          </div>
        </div>
      </main>
    </div>
  );
}

export default BuyerDashboard;
