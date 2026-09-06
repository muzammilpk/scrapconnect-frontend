import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';

function ScrapDetailPage() {
  usePageTitle('Scrap Listing Details');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected image gallery index
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Matching buyers & buyer conversations state
  const [matchingBuyers, setMatchingBuyers] = useState([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [scrapConversations, setScrapConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(false);

  useEffect(() => {
    const fetchScrapDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getScrapById(id);
        if (res.success && res.scrap) {
          setScrap(res.scrap);

          // Fetch matching buyers & buyer conversations if logged in user is the seller owner
          if (user && (res.scrap.seller?._id === user._id || res.scrap.seller === user._id)) {
            setLoadingBuyers(true);
            setLoadingConvs(true);
            try {
              const [matchRes, convsRes] = await Promise.all([
                api.getMatchingBuyers(id),
                api.getConversations(),
              ]);
              if (matchRes.success) {
                setMatchingBuyers(matchRes.buyers || []);
              }
              if (convsRes.success) {
                const filtered = (convsRes.conversations || []).filter((c) => {
                  const sId = typeof c.scrap === 'object' ? c.scrap?._id : c.scrap;
                  return String(sId) === String(id);
                });
                setScrapConversations(filtered);
              }
            } catch (mErr) {
              console.error('Failed to fetch scrap interactions:', mErr.message);
            } finally {
              setLoadingBuyers(false);
              setLoadingConvs(false);
            }
          }
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load scrap listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchScrapDetail();
  }, [id, user]);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMsg('');
    try {
      const res = await api.deleteScrap(id);
      if (res.success) {
        navigate('/seller/scraps', { state: { successMsg: 'Scrap listing removed successfully.' } });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove scrap listing.');
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
      <Navbar />

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
                <div className="main-image-container" style={{ position: 'relative' }}>
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
                  {scrap.images && scrap.images.length > 0 && selectedImgIndex === 0 && (
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(22, 163, 74, 0.9)', color: '#fff', fontSize: '0.75rem', fontWeight: '600', padding: '4px 8px', borderRadius: '4px' }}>
                      ⭐ Primary Photo
                    </span>
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

                {scrap.status === 'draft' && (
                  <div className="alert-warning" style={{ marginBottom: '1.25rem', background: '#FEF3C7', color: '#92400E', borderColor: '#F59E0B' }}>
                    📝 <strong>Draft Listing</strong> — This scrap is not visible in the marketplace and buyers have not been notified.
                  </div>
                )}

                {/* Weight & Price Cards */}
                <div className="detail-banner-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="weight-price-banner" style={{ margin: 0 }}>
                    <span className="banner-icon">⚖️</span>
                    <div>
                      <div className="banner-label">Estimated Quantity</div>
                      <div className="banner-value" style={{ fontSize: '1.1rem' }}>
                        {scrap.estimatedWeight ? `${scrap.estimatedWeight} ${scrap.weightUnit || 'kg'}` : 'Unspecified'}
                      </div>
                    </div>
                  </div>

                  <div className="weight-price-banner" style={{ margin: 0, background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                    <span className="banner-icon">🏷️</span>
                    <div>
                      <div className="banner-label">Expected Price</div>
                      <div className="banner-value" style={{ fontSize: '1.1rem', color: '#16A34A' }}>
                        {scrap.expectedPrice ? `₹${scrap.expectedPrice.toLocaleString('en-IN')}` : 'Offers Welcome'}
                      </div>
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
                    <span>Created:</span> <span>{formatDate(scrap.createdAt)}</span>
                  </div>
                </div>

                {/* Buyer Conversations & Offers Section (Seller Owner Only) */}
                {isOwner && (
                  <div className="detail-section enquiries-section" style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                    <h4 className="section-heading" style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span>💬</span> Interested Buyer Enquiries & Price Offers ({scrapConversations.length})
                    </h4>

                    {loadingConvs ? (
                      <p className="detail-text text-muted">Loading buyer enquiries...</p>
                    ) : scrapConversations.length === 0 ? (
                      <div className="matching-empty-box" style={{ padding: '0.75rem 1rem', background: '#FFFFFF', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                        <p className="detail-text text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                          No buyer has started a chat or sent an offer for this scrap item yet.
                        </p>
                      </div>
                    ) : (
                      <div className="buyer-enquiries-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {scrapConversations.map((c) => {
                          const buyerObj = c.buyer || {};
                          return (
                            <div
                              key={c._id}
                              className="buyer-enquiry-card"
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                borderRadius: '10px',
                                padding: '0.85rem 1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  👤 {buyerObj.name || 'Interested Buyer'}
                                  {c.unreadCount > 0 && (
                                    <span className="unread-dot-badge" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                                      {c.unreadCount} NEW
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                                  💬 {c.lastMessage || 'Buyer contacted regarding this scrap'}
                                </p>
                              </div>

                              <button
                                type="button"
                                className="btn-primary btn-sm"
                                onClick={() => navigate(`/chat/${c._id}`)}
                                style={{ flexShrink: 0, padding: '0.5rem 1rem' }}
                              >
                                💬 Open Chat & Negotiate
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Location Matching Buyers Section (Seller Owner Only) */}
                {isOwner && (
                  <div className="detail-section matching-section">
                    <h4 className="section-heading">🎯 Location Matching Buyers</h4>
                    {loadingBuyers ? (
                      <p className="detail-text text-muted">Searching for buyers in this region...</p>
                    ) : matchingBuyers.length === 0 ? (
                      <div className="matching-empty-box">
                        <p className="detail-text text-muted">
                          No registered buyers currently cover this specific service region.
                        </p>
                      </div>
                    ) : (
                      <div className="matching-buyers-box">
                        <div className="matching-count-badge">
                          ✅ <strong>{matchingBuyers.length}</strong> matching buyer{matchingBuyers.length > 1 ? 's' : ''} found in this region
                        </div>
                        <div className="matching-buyers-list">
                          {matchingBuyers.map((b) => (
                            <div key={b.id} className="matching-buyer-pill">
                              <div className="buyer-pill-main">
                                <span className="buyer-pill-name">👤 {b.name}</span>
                                <span className="buyer-match-reason">{b.matchReason}</span>
                              </div>
                              <div className="buyer-pill-loc">
                                📍 {b.matchingRegion.city}, {b.matchingRegion.district}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                      🗑️ Remove Listing
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
              <h3>⚠️ Confirm Removal</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this scrap listing? It will no longer be visible in marketplace searches.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing...' : 'Yes, Remove Listing'}
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
