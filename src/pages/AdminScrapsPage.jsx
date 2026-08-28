import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminScrapsPage = () => {
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Scrap Modal
  const [selectedScrap, setSelectedScrap] = useState(null);

  const fetchScraps = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminScraps({
        search,
        category,
        status,
        page,
        limit: 10,
      });
      setScraps(data.scraps || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalScraps || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch scrap listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScraps();
  }, [page, category, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchScraps();
  };

  const handleToggleStatus = async (scrapId, currentStatus, scrapTitle) => {
    const newStatus = currentStatus === 'removed' ? 'available' : 'removed';
    const actionLabel = newStatus === 'removed' ? 'Hide / Remove' : 'Restore';

    if (!window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} listing "${scrapTitle}"?`)) {
      return;
    }

    try {
      setError('');
      setActionSuccess('');
      const response = await api.updateAdminScrapStatus(scrapId, newStatus);
      setActionSuccess(response.message || `Listing status updated to ${newStatus}`);
      fetchScraps();
      if (selectedScrap && selectedScrap._id === scrapId) {
        setSelectedScrap({ ...selectedScrap, status: newStatus });
      }
    } catch (err) {
      setError(err.message || `Failed to update listing status`);
    }
  };

  const handleInspectScrap = async (scrapId) => {
    try {
      const detail = await api.getAdminScrapById(scrapId);
      setSelectedScrap(detail);
    } catch (err) {
      alert(`Failed to load scrap detail: ${err.message}`);
    }
  };

  const categoriesList = [
    'Metal',
    'Paper',
    'Plastic',
    'E-Waste',
    'Glass',
    'Vehicle Scrap',
    'Batteries',
    'Other',
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">Scrap Listings Moderation</h1>
            <p className="admin-page-subtitle">Inspect, moderate, and remove policy-violating scrap postings</p>
          </div>
          <div className="admin-header-actions">
            <span className="badge badge-primary">{totalCount} Total Listings</span>
          </div>
        </header>

        {error && <div className="alert-banner alert-danger">{error}</div>}
        {actionSuccess && <div className="alert-banner alert-success">{actionSuccess}</div>}

        {/* Filter Bar */}
        <div className="admin-filter-card">
          <form onSubmit={handleSearchSubmit} className="admin-filter-form">
            <div className="filter-group">
              <label>Search Title/City</label>
              <input
                type="text"
                placeholder="Title, description, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="form-control">
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="form-control">
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="deal_pending">Deal Pending</option>
                <option value="sold">Sold</option>
                <option value="removed">Removed / Hidden</option>
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
                  setCategory('');
                  setStatus('');
                  setPage(1);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Scraps Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading scrap listings...</p>
          </div>
        ) : scraps.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">📦</div>
            <h3>No Scrap Listings Found</h3>
            <p>No listings matched your criteria.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Seller</th>
                    <th>Location</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scraps.map((s) => (
                    <tr key={s._id} className={s.status === 'removed' ? 'row-suspended' : ''}>
                      <td>
                        <div className="scrap-table-cell">
                          {s.images && s.images[0] ? (
                            <img src={s.images[0]} alt={s.title} className="table-img-thumb" />
                          ) : (
                            <div className="table-img-thumb-placeholder">📦</div>
                          )}
                          <div>
                            <strong>{s.title}</strong>
                            {s.expectedPrice ? (
                              <div className="text-muted" style={{ fontSize: '0.8rem' }}>₹{s.expectedPrice}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{s.category}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {s.seller ? (
                          <>
                            <strong>{s.seller.name}</strong>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.seller.email}</div>
                          </>
                        ) : (
                          <span className="text-muted">Unknown Seller</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {s.location?.city || s.location?.district ? (
                          <div>{s.location.city || s.location.district}, {s.location.state}</div>
                        ) : (
                          <span className="text-muted">No location</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {s.estimatedWeight ? `${s.estimatedWeight} kg` : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          s.status === 'available' ? 'success' : s.status === 'sold' ? 'blue' : s.status === 'removed' ? 'danger' : 'amber'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="btn-sm btn-outline-info"
                            onClick={() => handleInspectScrap(s._id)}
                          >
                            👁️ Inspect
                          </button>
                          <button
                            className={`btn-sm ${s.status === 'removed' ? 'btn-success' : 'btn-danger'}`}
                            onClick={() => handleToggleStatus(s._id, s.status, s.title)}
                          >
                            {s.status === 'removed' ? '🔓 Restore' : '🚫 Remove'}
                          </button>
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

        {/* Selected Scrap Detail Modal */}
        {selectedScrap && (
          <div className="modal-overlay" onClick={() => setSelectedScrap(null)}>
            <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Listing Moderation: {selectedScrap.title}</h2>
                <button className="close-btn" onClick={() => setSelectedScrap(null)}>✕</button>
              </div>
              <div className="modal-body">
                {selectedScrap.images && selectedScrap.images.length > 0 && (
                  <div className="scrap-modal-gallery">
                    {selectedScrap.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Scrap ${idx}`} className="gallery-thumb" />
                    ))}
                  </div>
                )}

                <div className="info-grid-two" style={{ marginTop: '1rem' }}>
                  <div className="info-box">
                    <h4>📦 Details</h4>
                    <p><strong>Category:</strong> {selectedScrap.category}</p>
                    <p><strong>Estimated Weight:</strong> {selectedScrap.estimatedWeight || 'N/A'} kg</p>
                    <p><strong>Expected Price:</strong> {selectedScrap.expectedPrice ? `₹${selectedScrap.expectedPrice}` : 'Negotiable'}</p>
                    <p><strong>Status:</strong> <span className={`badge badge-${selectedScrap.status === 'available' ? 'success' : 'danger'}`}>{selectedScrap.status}</span></p>
                  </div>

                  <div className="info-box">
                    <h4>📍 Location & Seller</h4>
                    <p><strong>Seller Name:</strong> {selectedScrap.seller?.name || 'N/A'}</p>
                    <p><strong>Seller Email:</strong> {selectedScrap.seller?.email || 'N/A'}</p>
                    <p><strong>Location:</strong> {selectedScrap.location?.addressLine}, {selectedScrap.location?.city}, {selectedScrap.location?.district}, {selectedScrap.location?.state}</p>
                  </div>
                </div>

                <div className="info-box" style={{ marginTop: '1rem' }}>
                  <h4>📝 Description</h4>
                  <p>{selectedScrap.description || 'No description provided.'}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className={`btn-${selectedScrap.status === 'removed' ? 'success' : 'danger'}`}
                  onClick={() => handleToggleStatus(selectedScrap._id, selectedScrap.status, selectedScrap.title)}
                >
                  {selectedScrap.status === 'removed' ? '🔓 Restore Listing' : '🚫 Hide / Remove Listing'}
                </button>
                <button className="btn-secondary" onClick={() => setSelectedScrap(null)}>
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

export default AdminScrapsPage;
