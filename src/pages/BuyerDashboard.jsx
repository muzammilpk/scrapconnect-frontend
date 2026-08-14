import { useAuth } from '../context/AuthContext';

function BuyerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="navbar">
        <div className="navbar-brand">
          <span>♻️</span> ScrapConnect
        </div>
        <div className="user-badge">
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
          <h1 className="welcome-title">Welcome, Buyer</h1>
          <p className="welcome-sub">
            Logged in as <strong>{user?.email || user?.mobileNumber || user?.name}</strong>
          </p>
          <div className="placeholder-notice">
            📌 <strong>Buyer Dashboard Placeholder</strong> — Service area matching, scrap pickup requests, and buyer bidding will be implemented in subsequent project steps.
          </div>
        </div>
      </main>
    </div>
  );
}

export default BuyerDashboard;
