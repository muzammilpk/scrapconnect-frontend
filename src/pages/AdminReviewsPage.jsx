import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters & Pagination
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminReviews({
        rating,
        page,
        limit: 10,
      });
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalReviews || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, rating]);

  const handleDeleteReview = async (reviewId, reviewerName) => {
    if (!window.confirm(`Are you sure you want to delete this review by "${reviewerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setActionSuccess('');
      const response = await api.deleteAdminReview(reviewId);
      setActionSuccess(response.message || 'Review deleted successfully');
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">Reviews & Ratings Moderation</h1>
            <p className="admin-page-subtitle">Monitor and delete offensive or policy-violating user reviews</p>
          </div>
          <div className="admin-header-actions">
            <span className="badge badge-info">{totalCount} Total Reviews</span>
          </div>
        </header>

        {error && <div className="alert-banner alert-danger">{error}</div>}
        {actionSuccess && <div className="alert-banner alert-success">{actionSuccess}</div>}

        {/* Filters */}
        <div className="admin-filter-card">
          <div className="admin-filter-form">
            <div className="filter-group">
              <label>Filter by Rating</label>
              <select value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }} className="form-control">
                <option value="">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>
            <div className="filter-group-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setRating(''); setPage(1); }}
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">⭐</div>
            <h3>No Reviews Found</h3>
            <p>No user reviews matched your filter.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Reviewed User</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.reviewer?.name || 'Anonymous'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{r.reviewer?.email}</div>
                      </td>
                      <td>
                        <strong>{r.reviewee?.name || 'Anonymous'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{r.reviewee?.email}</div>
                      </td>
                      <td>
                        <span className="star-rating-pill">
                          {'⭐'.repeat(r.rating)} ({r.rating}/5)
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>
                        {r.comment ? (
                          <p style={{ margin: 0, fontStyle: 'italic' }}>"{r.comment}"</p>
                        ) : (
                          <span className="text-muted">No comment provided</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => handleDeleteReview(r._id, r.reviewer?.name || 'User')}
                        >
                          🗑️ Delete Review
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
      </main>
    </div>
  );
};

export default AdminReviewsPage;
