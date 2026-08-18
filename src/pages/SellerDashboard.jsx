import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
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

      <main className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Seller Dashboard</h1>
          <p className="welcome-sub">
            Welcome, <strong>{user?.name}</strong>
          </p>

          <div className="location-summary-card">
            <div className="location-summary-header">
              <span className="location-summary-icon">📍</span>
              <div>
                <div className="location-summary-label">Location:</div>
                <div className="location-summary-value">{locationDisplay}</div>
              </div>
            </div>
            {(!area && !city) && (
              <button className="btn-link-sm" onClick={() => navigate('/profile')}>
                Update Location →
              </button>
            )}
          </div>

          <div className="placeholder-notice">
            📌 <strong>Seller Dashboard Placeholder</strong> — Scrap listings, pickup scheduling, and price offers will be implemented in subsequent project steps.
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;
