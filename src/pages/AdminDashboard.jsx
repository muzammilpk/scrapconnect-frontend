import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import usePageTitle from '../hooks/usePageTitle';

const AdminDashboard = () => {
  usePageTitle('Admin Dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">Platform Dashboard</h1>
            <p className="admin-page-subtitle">Real-time metrics, user growth, and activity monitoring</p>
          </div>
          <button className="btn-secondary" onClick={fetchStats} disabled={loading}>
            🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </header>

        {error && <div className="alert-banner alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading analytics data...</p>
          </div>
        ) : stats ? (
          <div className="admin-dashboard-container">
            {/* Top Key Metrics */}
            <div className="stat-cards-grid">
              <StatCard
                title="Total Users"
                value={stats.users?.total || 0}
                icon="👥"
                subtext={`${stats.users?.buyers || 0} Buyers | ${stats.users?.sellers || 0} Sellers`}
                color="blue"
              />
              <StatCard
                title="Scrap Listings"
                value={stats.scraps?.total || 0}
                icon="📦"
                subtext={`${stats.scraps?.available || 0} Available | ${stats.scraps?.sold || 0} Sold`}
                color="green"
              />
              <StatCard
                title="Total Deals"
                value={stats.deals?.total || 0}
                icon="🤝"
                subtext={`${stats.deals?.completed || 0} Completed | ${stats.deals?.accepted || 0} Active`}
                color="purple"
              />
              <StatCard
                title="Total Completed Value"
                value={`₹${(stats.revenue?.totalCompletedValue || 0).toLocaleString('en-IN')}`}
                icon="💰"
                subtext={`Volume: ${(stats.revenue?.totalScrapVolumeKg || 0).toLocaleString('en-IN')} kg`}
                color="emerald"
              />
              <StatCard
                title="Pending / Active Deals"
                value={stats.deals?.accepted + stats.deals?.pending || 0}
                icon="⏳"
                subtext={`${stats.deals?.pending || 0} Pending | ${stats.deals?.accepted || 0} In-Progress`}
                color="amber"
              />
              <StatCard
                title="User Reports"
                value={stats.reports?.pending || 0}
                icon="🚩"
                subtext={`${stats.reports?.total || 0} Total Reports`}
                color="red"
              />
            </div>

            {/* Category Breakdown & Platform Health */}
            <div className="admin-grid-two-col" style={{ marginTop: '1.5rem' }}>
              <div className="admin-card">
                <h3 className="admin-card-title">📦 Scrap Listings by Category</h3>
                <div className="category-bars-list">
                  {stats.scrapsByCategory && stats.scrapsByCategory.length > 0 ? (
                    stats.scrapsByCategory.map((item) => (
                      <div key={item._id} className="category-bar-item">
                        <div className="category-bar-label">
                          <span className="category-name">{item._id}</span>
                          <span className="category-count">{item.count} listing(s)</span>
                        </div>
                        <div className="category-bar-bg">
                          <div
                            className="category-bar-fill"
                            style={{
                              width: `${Math.min(100, (item.count / (stats.scraps?.total || 1)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">No category data available yet.</p>
                  )}
                </div>
              </div>

              <div className="admin-card">
                <h3 className="admin-card-title">🛡️ System Health & Moderation</h3>
                <div className="health-stats-list">
                  <div className="health-stat-row">
                    <span>Active Users</span>
                    <span className="badge badge-success">{stats.users?.active || 0}</span>
                  </div>
                  <div className="health-stat-row">
                    <span>Suspended Accounts</span>
                    <span className="badge badge-danger">{stats.users?.suspended || 0}</span>
                  </div>
                  <div className="health-stat-row">
                    <span>Removed Listings</span>
                    <span className="badge badge-warning">{stats.scraps?.removed || 0}</span>
                  </div>
                  <div className="health-stat-row">
                    <span>Total Reviews Given</span>
                    <span className="badge badge-info">{stats.reviews?.total || 0}</span>
                  </div>
                  <div className="health-stat-row">
                    <span>Average Platform Rating</span>
                    <span className="badge badge-primary">
                      ⭐ {stats.reviews?.averageRating ? stats.reviews.averageRating.toFixed(1) : 'N/A'} / 5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Sections */}
            <div className="admin-grid-two-col" style={{ marginTop: '1.5rem' }}>
              {/* Recent Users */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">🆕 Recently Registered Users</h3>
                </div>
                {stats.recentActivity?.users && stats.recentActivity.users.length > 0 ? (
                  <div className="table-responsive">
                    <table className="admin-table mini-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentActivity.users.map((u) => (
                          <tr key={u._id}>
                            <td>
                              <strong>{u.name}</strong>
                              <br />
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{u.email}</span>
                            </td>
                            <td>
                              <span className={`badge badge-${u.role === 'admin' ? 'purple' : u.role === 'buyer' ? 'blue' : 'green'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-text">No recent user registrations.</p>
                )}
              </div>

              {/* Recent Deals */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">🤝 Recent Deals</h3>
                </div>
                {stats.recentActivity?.deals && stats.recentActivity.deals.length > 0 ? (
                  <div className="table-responsive">
                    <table className="admin-table mini-table">
                      <thead>
                        <tr>
                          <th>Scrap Title</th>
                          <th>Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentActivity.deals.map((d) => (
                          <tr key={d._id}>
                            <td>
                              <strong>{d.scrap?.title || 'Unknown Scrap'}</strong>
                              <br />
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                Seller: {d.seller?.name || 'N/A'} | Buyer: {d.buyer?.name || 'N/A'}
                              </span>
                            </td>
                            <td>₹{d.agreedPrice?.toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`badge badge-${
                                d.status === 'completed' ? 'success' : d.status === 'cancelled' ? 'danger' : 'amber'
                              }`}>
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-text">No recent transactions recorded.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AdminDashboard;
