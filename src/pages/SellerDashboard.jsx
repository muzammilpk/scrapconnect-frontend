import { useAuth } from '../context/AuthContext';

function SellerDashboard() {
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
            <span className="role-tag">Seller ♻️</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Welcome, Seller</h1>
          <p className="welcome-sub">
            Logged in as <strong>{user?.email || user?.mobileNumber || user?.name}</strong>
          </p>
          <div className="placeholder-notice">
            📌 <strong>Seller Dashboard Placeholder</strong> — Scrap listings, pickup scheduling, and price offers will be implemented in subsequent project steps.
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;
