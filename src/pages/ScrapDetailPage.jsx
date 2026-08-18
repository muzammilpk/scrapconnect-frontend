import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ScrapDetailPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected image gallery index
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchScrapDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getScrapById(id);
        if (res.success && res.scrap) {
          setScrap(res.scrap);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load scrap listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchScrapDetail();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMsg('');
    try {
      const res = await api.deleteScrap(id);
      if (res.success) {
        navigate('/seller/scraps', { state: { successMsg: 'Scrap listing deleted successfully.' } });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete scrap listing.');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = scrap && user && (scrap.seller?._id === user._id || scrap.seller === user._id);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <button className="btn-secondary" onClick={() => navigate('/seller/scraps')}>
            ← Back to Listings
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
        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

        {loading ? (
          <div className="loading-card">Loading scrap listing details...</div>
        ) : !scrap ? (
          <div className="empty-listings-card">
            <h3>Scrap Listing Not Found</h3>
            <button className="btn-primary" onClick={() => navigate('/seller/scraps')}>
              Back to My Listings
            </button>
          </div>
        ) : (
          <div className="scrap-detail-wrapper">
            {/* Detail Layout */}
            <div className="scrap-detail-grid">
              {/* Left Column: Image Gallery */}
              <div className="scrap-gallery-card">
                <div className="main-image-container">
                  {scrap.images && scrap.images.length > 0 ? (
                    <img
                      src={scrap.images[selectedImgIndex]?.url || scrap.images[0].url}
                      alt={scrap.title}
                      className="main-detail-img"
                    />
                  ) : (
                    <div className="detail-img-placeholder">
                      <span>📦</span>
                      <p>No Image Available</p>
                    </div>
                  )}
                </div>

                {scrap.images && scrap.images.length > 1 && (
                  <div className="gallery-thumbnails">
                    {scrap.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`thumb-box ${selectedImgIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedImgIndex(idx)}
                      >
                        <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="thumb-img" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Meta Details */}
              <div className="scrap-info-card">
                <div className="detail-header-tags">
                  <span className="category-chip">{scrap.category}</span>
                  <span className={`status-badge ${scrap.status}`}>
                    {scrap.status?.toUpperCase()}
                  </span>
                </div>

                <h1 className="detail-title">{scrap.title}</h1>

                <div className="weight-price-banner">
                  <span className="banner-icon">⚖️</span>
                  <div>
                    <div className="banner-label">Estimated Quantity</div>
                    <div className="banner-value">
                      {scrap.estimatedWeight} {scrap.weightUnit || 'kg'}
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="detail-section">
                  <h4 className="section-heading">📍 Pickup Location</h4>
                  <p className="detail-text">
                    <strong>{scrap.location?.area ? `${scrap.location.area}, ` : ''}{scrap.location?.city}</strong>
                    <br />
                    {scrap.location?.district} District, {scrap.location?.state}
                    {scrap.location?.pincode ? ` - ${scrap.location.pincode}` : ''}
                  </p>
                </div>

                {/* Description */}
                {scrap.description && (
                  <div className="detail-section">
                    <h4 className="section-heading">📝 Description</h4>
                    <p className="detail-text description-body">{scrap.description}</p>
                  </div>
                )}

                {/* Listing Footer Meta */}
                <div className="detail-meta-footer">
                  <div className="meta-footer-item">
                    <span>Seller:</span> <strong>{scrap.seller?.name || user?.name}</strong>
                  </div>
                  <div className="meta-footer-item">
                    <span>Published:</span> <span>{formatDate(scrap.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons for Owner */}
                {isOwner && (
                  <div className="detail-actions-row">
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/seller/scraps/${scrap._id}/edit`)}
                    >
                      ✏️ Edit Listing
                    </button>
                    <button
                      className="btn-secondary btn-danger-text"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      🗑️ Delete Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-confirm">
            <div className="modal-header">
              <h3>⚠️ Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this scrap listing? This cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete Listing'}
              </button>
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScrapDetailPage;
