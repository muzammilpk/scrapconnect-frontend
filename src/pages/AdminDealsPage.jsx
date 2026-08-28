import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminDealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal
  const [selectedDeal, setSelectedDeal] = useState(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminDeals({
        status,
        page,
        limit: 10,
      });
      setDeals(data.deals || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalDeals || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch platform deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [page, status]);

  const handleInspectDeal = async (dealId) => {
    try {
      const detail = await api.getAdminDealById(dealId);
      setSelectedDeal(detail);
    } catch (err) {
      alert(`Failed to fetch deal detail: ${err.message}`);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">Deals & Transactions</h1>
            <p className="admin-page-subtitle">Read-only transaction monitoring and audit logs</p>
          </div>
          <div className="admin-header-actions">
            <span className="badge badge-purple">{totalCount} Total Deals Recorded</span>
          </div>
        </header>

        {error && <div className="alert-banner alert-danger">{error}</div>}

        {/* Filters */}
        <div className="admin-filter-card">
          <div className="admin-filter-form">
            <div className="filter-group">
              <label>Deal Status</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="form-control">
                <option value="">All Deal Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted / Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-group-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setStatus(''); setPage(1); }}
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Deals Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">🤝</div>
            <h3>No Transactions Recorded</h3>
            <p>No deals match the selected filter.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Scrap Item</th>
                    <th>Seller</th>
                    <th>Buyer</th>
                    <th>Agreed Price</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <strong>{d.scrap?.title || 'Unknown Scrap'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{d.scrap?.category}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{d.seller?.name || 'N/A'}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{d.seller?.email}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{d.buyer?.name || 'N/A'}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{d.buyer?.email}</div>
                      </td>
                      <td>
                        <strong>₹{d.agreedPrice?.toLocaleString('en-IN')}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          d.status === 'completed' ? 'success' : d.status === 'cancelled' ? 'danger' : d.status === 'accepted' ? 'blue' : 'amber'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-outline-info"
                          onClick={() => handleInspectDeal(d._id)}
                        >
                          👁️ Inspect Deal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

        {/* Selected Deal Inspector Modal */}
        {selectedDeal && (
          <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
            <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Transaction Audit: Deal #{selectedDeal._id.slice(-6)}</h2>
                <button className="close-btn" onClick={() => setSelectedDeal(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="info-grid-two">
                  <div className="info-box">
                    <h4>📦 Scrap Information</h4>
                    <p><strong>Title:</strong> {selectedDeal.scrap?.title}</p>
                    <p><strong>Category:</strong> {selectedDeal.scrap?.category}</p>
                    <p><strong>Est. Weight:</strong> {selectedDeal.scrap?.estimatedWeight || 'N/A'} kg</p>
                  </div>

                  <div className="info-box">
                    <h4>💰 Financials & Status</h4>
                    <p><strong>Agreed Price:</strong> ₹{selectedDeal.agreedPrice?.toLocaleString('en-IN')}</p>
                    <p><strong>Status:</strong> <span className={`badge badge-${selectedDeal.status === 'completed' ? 'success' : selectedDeal.status === 'cancelled' ? 'danger' : 'amber'}`}>{selectedDeal.status}</span></p>
                    {selectedDeal.completedAt && <p><strong>Completed At:</strong> {new Date(selectedDeal.completedAt).toLocaleString()}</p>}
                    {selectedDeal.cancelledAt && <p><strong>Cancelled At:</strong> {new Date(selectedDeal.cancelledAt).toLocaleString()}</p>}
                    {selectedDeal.cancellationReason && <p className="text-danger"><strong>Reason:</strong> {selectedDeal.cancellationReason}</p>}
                  </div>
                </div>

                <div className="info-grid-two" style={{ marginTop: '1rem' }}>
                  <div className="info-box">
                    <h4>👤 Seller</h4>
                    <p><strong>Name:</strong> {selectedDeal.seller?.name}</p>
                    <p><strong>Email:</strong> {selectedDeal.seller?.email}</p>
                    <p><strong>Phone:</strong> {selectedDeal.seller?.phone || 'N/A'}</p>
                  </div>

                  <div className="info-box">
                    <h4>👤 Buyer</h4>
                    <p><strong>Name:</strong> {selectedDeal.buyer?.name}</p>
                    <p><strong>Email:</strong> {selectedDeal.buyer?.email}</p>
                    <p><strong>Phone:</strong> {selectedDeal.buyer?.phone || 'N/A'}</p>
                  </div>
                </div>

                {selectedDeal.pickupDetails && (
                  <div className="info-box" style={{ marginTop: '1rem' }}>
                    <h4>🚚 Scheduled Pickup & Address</h4>
                    <p><strong>Scheduled Date:</strong> {selectedDeal.pickupDetails.date ? new Date(selectedDeal.pickupDetails.date).toLocaleDateString() : 'Not scheduled'}</p>
                    <p><strong>Time Slot:</strong> {selectedDeal.pickupDetails.timeSlot || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedDeal.pickupDetails.address || 'N/A'}</p>
                    {selectedDeal.pickupDetails.notes && <p><strong>Notes:</strong> {selectedDeal.pickupDetails.notes}</p>}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedDeal(null)}>
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDealsPage;
