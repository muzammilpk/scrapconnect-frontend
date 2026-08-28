import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters & Pagination
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Resolution Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminReports({
        status,
        page,
        limit: 10,
      });
      setReports(data.reports || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalReports || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch user reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, status]);

  const handleOpenResolveModal = (report, newStatus) => {
    setSelectedReport(report);
    setTargetStatus(newStatus);
    setResolutionNotes(report.resolutionNotes || '');
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setSubmitting(true);
      setError('');
      setActionSuccess('');
      const response = await api.updateAdminReportStatus(
        selectedReport._id,
        targetStatus,
        resolutionNotes
      );
      setActionSuccess(response.message || `Report status updated to ${targetStatus}`);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      setError(err.message || 'Failed to update report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">User Reports & Moderation</h1>
            <p className="admin-page-subtitle">Review, investigate, and resolve user-submitted violation reports</p>
          </div>
          <div className="admin-header-actions">
            <span className="badge badge-danger">{totalCount} User Reports</span>
          </div>
        </header>

        {error && <div className="alert-banner alert-danger">{error}</div>}
        {actionSuccess && <div className="alert-banner alert-success">{actionSuccess}</div>}

        {/* Filter Bar */}
        <div className="admin-filter-card">
          <div className="admin-filter-form">
            <div className="filter-group">
              <label>Report Status</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="form-control">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
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

        {/* Reports Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">🚩</div>
            <h3>No Reports Found</h3>
            <p>No user reports match your filter criteria.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reporter</th>
                    <th>Target / Type</th>
                    <th>Reason</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.reporter?.name || 'Anonymous User'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{r.reporter?.email}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                          {r.targetType}
                        </span>
                        {r.reportedUser && (
                          <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            User: {r.reportedUser.name}
                          </div>
                        )}
                        {r.reportedScrap && (
                          <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            Item: {r.reportedScrap.title}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.85rem', color: '#DC2626' }}>{r.reason}</strong>
                      </td>
                      <td style={{ maxWidth: '260px', fontSize: '0.85rem' }}>
                        {r.description ? (
                          <p style={{ margin: 0 }}>{r.description}</p>
                        ) : (
                          <span className="text-muted">No details provided</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          r.status === 'resolved' ? 'success' : r.status === 'dismissed' ? 'secondary' : r.status === 'under_review' ? 'amber' : 'danger'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="btn-sm btn-success"
                            onClick={() => handleOpenResolveModal(r, 'resolved')}
                          >
                            ✅ Resolve
                          </button>
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => handleOpenResolveModal(r, 'dismissed')}
                          >
                            🚫 Dismiss
                          </button>
                        </div>
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

        {/* Resolution Modal */}
        {selectedReport && (
          <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
            <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {targetStatus === 'resolved' ? '✅ Resolve Report' : '🚫 Dismiss Report'}
                </h2>
                <button className="close-btn" onClick={() => setSelectedReport(null)}>✕</button>
              </div>
              <form onSubmit={handleUpdateReport}>
                <div className="modal-body">
                  <div className="info-box">
                    <p><strong>Reason:</strong> {selectedReport.reason}</p>
                    <p><strong>Reported Target:</strong> {selectedReport.targetType}</p>
                    <p><strong>Reporter:</strong> {selectedReport.reporter?.name} ({selectedReport.reporter?.email})</p>
                    {selectedReport.description && (
                      <p><strong>Details:</strong> {selectedReport.description}</p>
                    )}
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Action / Resolution Notes</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Add internal moderator notes or description of action taken..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="submit"
                    className={`btn-${targetStatus === 'resolved' ? 'success' : 'secondary'}`}
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : targetStatus === 'resolved' ? 'Confirm Resolution' : 'Confirm Dismissal'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline-secondary"
                    onClick={() => setSelectedReport(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReportsPage;
