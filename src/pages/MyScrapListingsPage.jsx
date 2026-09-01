import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function MyScrapListingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const locationState = useLocation();

  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(locationState.state?.successMsg || '');

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchScraps = async () => {
    setLoading(true);
    try {
      const res = await api.getMyScraps();
      if (res.success) {
        setScraps(res.scraps || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load scrap listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScraps();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    setErrorMsg('');
    try {
      const res = await api.deleteScrap(deletingId);
      if (res.success) {
        setSuccessMsg('Scrap listing removed successfully');
        setScraps((prev) => prev.filter((s) => s._id !== deletingId));
        setDeletingId(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove scrap listing');
    } finally {
      setDeleting(false);
    }
  };

  const filteredScraps = scraps.filter((scrap) => {
    if (statusFilter === 'all') return true;
    return scrap.status === statusFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/seller/dashboard')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/seller/dashboard')}>
            ← Dashboard
          </button>
          <button className="btn-secondary" onClick={() => navigate('/seller/add-scrap')}>
            ➕ Add Scrap
          </button>
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

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Banner Messages */}
        {successMsg && <div className="alert-success">✅ {successMsg}</div>}
        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

        <div className="listings-header">
          <div>
            <h1 className="welcome-title">My Scrap Listings</h1>
            <p className="welcome-sub">Manage your published scrap items, drafts, and availability status</p>
          </div>

          <button className="btn-primary add-scrap-header-btn" onClick={() => navigate('/seller/add-scrap')}>
            ➕ Publish New Scrap
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="status-tabs-row">
          <button
            className={`status-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({scraps.length})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'available' ? 'active' : ''}`}
            onClick={() => setStatusFilter('available')}
          >
            Available ({scraps.filter((s) => s.status === 'available').length})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            Drafts ({scraps.filter((s) => s.status === 'draft').length})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'reserved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('reserved')}
          >
            Reserved ({scraps.filter((s) => s.status === 'reserved').length})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'sold' ? 'active' : ''}`}
            onClick={() => setStatusFilter('sold')}
          >
            Sold ({scraps.filter((s) => s.status === 'sold').length})
          </button>
        </div>

        {loading ? (
          <div className="loading-card">Loading scrap listings...</div>
        ) : filteredScraps.length === 0 ? (
          <div className="empty-listings-card">
            <div className="empty-icon">📦</div>
            <h3>No Scrap Listings Found</h3>
            <p>
              {statusFilter === 'all'
                ? "You haven't created any scrap listings yet."
                : `No listings with status "${statusFilter}".`}
            </p>
            <button className="btn-primary" onClick={() => navigate('/seller/add-scrap')} style={{ marginTop: '1rem' }}>
              + Publish Scrap Now
            </button>
          </div>
        ) : (
          <div className="scraps-grid">
            {filteredScraps.map((scrap) => {
              const coverImg = scrap.images && scrap.images.length > 0 ? scrap.images[0].url : null;
              const locationStr = [scrap.location?.area, scrap.location?.city, scrap.location?.state]
                .filter(Boolean)
                .join(', ');

              return (
                <div key={scrap._id} className="scrap-card">
                  <div className="scrap-card-image-wrapper">
                    {coverImg ? (
                      <img src={coverImg} alt={scrap.title} className="scrap-card-img" />
                    ) : (
                      <div className="scrap-card-img-placeholder">
                        <span>📦</span>
                      </div>
                    )}
                    <span className={`status-badge ${scrap.status}`}>
                      {scrap.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="scrap-card-body">
                    <div className="scrap-category-tag">{scrap.category}</div>
                    <h3 className="scrap-card-title">{scrap.title}</h3>

                    <div className="scrap-meta-row">
                      {scrap.estimatedWeight ? (
                        <div className="meta-item">
                          <span className="meta-icon">⚖️</span>
                          <strong>{scrap.estimatedWeight} {scrap.weightUnit || 'kg'}</strong>
                        </div>
                      ) : (
                        <div className="meta-item">
                          <span className="meta-icon">⚖️</span>
                          <span>Unspecified Weight</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span className="meta-icon">🏷️</span>
                        <strong style={{ color: '#16A34A' }}>
                          {scrap.expectedPrice ? `₹${scrap.expectedPrice.toLocaleString('en-IN')}` : 'Offers Welcome'}
                        </strong>
                      </div>
                    </div>

                    <div className="scrap-meta-row" style={{ marginTop: '0.3rem' }}>
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span>{locationStr || 'Location set'}</span>
                      </div>
                    </div>

                    <div className="scrap-date-footer">
                      {scrap.status === 'draft' ? 'Created Draft on ' : 'Published on '} {formatDate(scrap.createdAt)}
                    </div>
                  </div>

                  <div className="scrap-card-actions">
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => navigate(`/seller/scraps/${scrap._id}`)}
                    >
                      👁️ View
                    </button>
                    {['available', 'draft'].includes(scrap.status) && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => navigate(`/seller/scraps/${scrap._id}/edit`)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {['available', 'draft'].includes(scrap.status) && (
                      <button
                        className="btn-danger-link btn-sm"
                        onClick={() => setDeletingId(scrap._id)}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingId && (
        <div className="modal-overlay">
          <div className="modal-card modal-confirm">
            <div className="modal-header">
              <h3>⚠️ Confirm Removal</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this scrap listing? It will no longer appear in the marketplace.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing...' : 'Yes, Remove Listing'}
              </button>
              <button className="btn-secondary" onClick={() => setDeletingId(null)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyScrapListingsPage;
