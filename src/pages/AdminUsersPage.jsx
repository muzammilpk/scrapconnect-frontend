import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalLoading, setUserModalLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminUsers({
        search,
        role,
        status,
        page,
        limit: 10,
      });
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalUsers || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const actionLabel = newStatus === 'suspended' ? 'Suspend' : 'Activate';

    if (!window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} user "${userName}"?`)) {
      return;
    }

    try {
      setError('');
      setActionSuccess('');
      const response = await api.updateAdminUserStatus(userId, newStatus);
      setActionSuccess(response.message || `User status updated to ${newStatus}`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (err) {
      setError(err.message || `Failed to update user status`);
    }
  };

  const handleInspectUser = async (userId) => {
    try {
      setUserModalLoading(true);
      const userDetail = await api.getAdminUserById(userId);
      setSelectedUser(userDetail);
    } catch (err) {
      alert(`Failed to load user details: ${err.message}`);
    } finally {
      setUserModalLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">Users Management</h1>
            <p className="admin-page-subtitle">Monitor, inspect, and moderate buyer, seller, and admin accounts</p>
          </div>
          <div className="admin-header-actions">
            <span className="badge badge-primary">{totalCount} Registered Users</span>
          </div>
        </header>

        {error && <div className="alert-banner alert-danger">{error}</div>}
        {actionSuccess && <div className="alert-banner alert-success">{actionSuccess}</div>}

        {/* Filters bar */}
        <div className="admin-filter-card">
          <form onSubmit={handleSearchSubmit} className="admin-filter-form">
            <div className="filter-group">
              <label>Search User</label>
              <input
                type="text"
                placeholder="Name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="filter-group">
              <label>Role</label>
              <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="form-control">
                <option value="">All Roles</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Account Status</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="form-control">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="filter-group-actions">
              <button type="submit" className="btn-primary">
                🔍 Filter
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearch('');
                  setRole('');
                  setStatus('');
                  setPage(1);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">👥</div>
            <h3>No Users Found</h3>
            <p>No user accounts matched your search criteria.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className={u.status === 'suspended' ? 'row-suspended' : ''}>
                      <td>
                        <div className="user-table-cell">
                          <div className="user-avatar-sm">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <strong>{u.name}</strong>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{u.email}</div>
                            {u.phone && <div className="text-muted" style={{ fontSize: '0.8rem' }}>📞 {u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${u.role === 'admin' ? 'purple' : u.role === 'buyer' ? 'blue' : 'green'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {u.address?.city || u.address?.district ? (
                          <>
                            {u.address?.city && <div>{u.address.city}</div>}
                            <div className="text-muted">{u.address?.district}, {u.address?.state}</div>
                          </>
                        ) : (
                          <span className="text-muted">Not specified</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${u.status === 'suspended' ? 'danger' : 'success'}`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="btn-sm btn-outline-info"
                            onClick={() => handleInspectUser(u._id)}
                            title="Inspect User Details"
                          >
                            👁️ Inspect
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              className={`btn-sm ${u.status === 'suspended' ? 'btn-success' : 'btn-danger'}`}
                              onClick={() => handleToggleStatus(u._id, u.status, u.name)}
                            >
                              {u.status === 'suspended' ? '🔓 Activate' : '⛔ Suspend'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  ◀ Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  className="btn-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Detail Inspection Modal */}
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Inspection: {selectedUser.name}</h2>
                <button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="user-profile-overview">
                  <div className="profile-header-meta">
                    <div className="user-avatar-lg">
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3>{selectedUser.name}</h3>
                      <p className="text-muted">{selectedUser.email} | {selectedUser.phone || 'No Phone'}</p>
                      <div className="badges-list" style={{ gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span className={`badge badge-${selectedUser.role === 'admin' ? 'purple' : selectedUser.role === 'buyer' ? 'blue' : 'green'}`}>
                          {selectedUser.role}
                        </span>
                        <span className={`badge badge-${selectedUser.status === 'suspended' ? 'danger' : 'success'}`}>
                          Status: {selectedUser.status || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-grid-two" style={{ marginTop: '1rem' }}>
                    <div className="info-box">
                      <h4>📍 Registered Address</h4>
                      <p>{selectedUser.address?.street || 'No street'}</p>
                      <p>{selectedUser.address?.city}, {selectedUser.address?.district}</p>
                      <p>{selectedUser.address?.state} - {selectedUser.address?.pincode}</p>
                    </div>

                    <div className="info-box">
                      <h4>⭐ Reputation & Ratings</h4>
                      <p>Average Rating: <strong>{selectedUser.stats?.averageRating ? selectedUser.stats.averageRating.toFixed(1) : 'N/A'} / 5.0</strong></p>
                      <p>Total Reviews: <strong>{selectedUser.stats?.totalReviews || 0}</strong></p>
                      <p>Joined Date: <strong>{new Date(selectedUser.createdAt).toLocaleDateString()}</strong></p>
                    </div>
                  </div>

                  {selectedUser.role === 'seller' && (
                    <div className="user-stats-section" style={{ marginTop: '1rem' }}>
                      <h4>📦 Listings Summary</h4>
                      <p>Total Scrap Posted: <strong>{selectedUser.stats?.scrapsCount || 0}</strong></p>
                    </div>
                  )}

                  {selectedUser.role === 'buyer' && (
                    <div className="user-stats-section" style={{ marginTop: '1rem' }}>
                      <h4>🗺️ Service Regions</h4>
                      <p>Configured Regions: <strong>{selectedUser.stats?.serviceRegionsCount || 0}</strong></p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {selectedUser.role !== 'admin' && (
                  <button
                    className={`btn-${selectedUser.status === 'suspended' ? 'success' : 'danger'}`}
                    onClick={() => handleToggleStatus(selectedUser._id, selectedUser.status, selectedUser.name)}
                  >
                    {selectedUser.status === 'suspended' ? '🔓 Activate Account' : '⛔ Suspend Account'}
                  </button>
                )}
                <button className="btn-secondary" onClick={() => setSelectedUser(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsersPage;
