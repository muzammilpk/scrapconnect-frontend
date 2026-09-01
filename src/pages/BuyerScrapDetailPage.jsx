import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function BuyerScrapDetailPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [contactNotice, setContactNotice] = useState('');

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetchScrapDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getScrapById(id);
        if (res.success && res.scrap) {
          setScrap(res.scrap);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load scrap details');
      } finally {
        setLoading(false);
      }
    };

    fetchScrapDetail();
  }, [id]);

  const handleContactClick = async () => {
    if (!scrap || startingChat) return;
    setStartingChat(true);
    setErrorMsg('');
    try {
      const res = await api.createOrGetConversation(scrap._id);
      if (res.success && res.conversation) {
        navigate(`/chat/${res.conversation._id}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start chat conversation with seller');
    } finally {
      setStartingChat(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/buyer/dashboard')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/buyer/browse')}>
            ← Back to Marketplace
          </button>
          <button className="btn-secondary" onClick={() => navigate('/buyer/service-regions')}>
            📍 Service Regions
          </button>
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className="role-tag" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              Buyer 🛒
            </span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
        {contactNotice && <div className="alert-success">📌 {contactNotice}</div>}

        {loading ? (
          <div className="loading-card">Loading scrap listing details...</div>
        ) : !scrap ? (
          <div className="empty-listings-card">
            <h3>Scrap Listing Not Found</h3>
            <button className="btn-primary" onClick={() => navigate('/buyer/browse')}>
              Back to Marketplace
            </button>
          </div>
        ) : (
          <div className="scrap-detail-wrapper">
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
                      <p>No Photo Provided</p>
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

              {/* Right Column: Listing & Seller Info */}
              <div className="scrap-info-card">
                <div className="detail-header-tags">
                  <span className="category-chip">{scrap.category}</span>
                  <span className={`status-badge ${scrap.status}`}>
                    {scrap.status?.toUpperCase()}
                  </span>
                </div>

                <h1 className="detail-title">{scrap.title}</h1>

                {/* Weight & Price Cards */}
                <div className="detail-banner-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="weight-price-banner" style={{ margin: 0 }}>
                    <span className="banner-icon">⚖️</span>
                    <div>
                      <div className="banner-label">Quantity / Weight</div>
                      <div className="banner-value" style={{ fontSize: '1.1rem' }}>
                        {scrap.estimatedWeight ? `${scrap.estimatedWeight} ${scrap.weightUnit || 'kg'}` : 'Contact Seller'}
                      </div>
                    </div>
                  </div>

                  <div className="weight-price-banner" style={{ margin: 0, background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                    <span className="banner-icon">🏷️</span>
                    <div>
                      <div className="banner-label">Expected Price</div>
                      <div className="banner-value" style={{ fontSize: '1.1rem', color: '#16A34A' }}>
                        {scrap.expectedPrice ? `₹${scrap.expectedPrice.toLocaleString('en-IN')}` : 'Open to Offers'}
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
                    <h4 className="section-heading">📝 Item Details & Description</h4>
                    <p className="detail-text description-body">{scrap.description}</p>
                  </div>
                )}

                {/* Seller Info Card */}
                <div className="seller-contact-card">
                  <h4 className="section-heading">👤 Seller Information</h4>
                  <div className="seller-info-row">
                    <div className="seller-avatar-mini">
                      {scrap.seller?.name ? scrap.seller.name[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div className="seller-name-text">{scrap.seller?.name || 'Verified Seller'}</div>
                      {scrap.seller?.mobileNumber && (
                        <div className="seller-sub-text">📞 {scrap.seller.mobileNumber}</div>
                      )}
                      {scrap.seller?.email && (
                        <div className="seller-sub-text">📧 {scrap.seller.email}</div>
                      )}
                      {scrap.seller?._id && (
                        <button
                          type="button"
                          className="btn-link-sm"
                          onClick={() => navigate(`/users/${scrap.seller._id}/profile`)}
                          style={{ marginTop: '0.3rem', display: 'inline-block' }}
                        >
                          👤 View Seller Profile →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="detail-meta-footer">
                  <span>Posted on {formatDate(scrap.createdAt)}</span>
                </div>

                {/* Contact Seller & Make Offer Action Buttons */}
                <div className="contact-seller-action-row" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  {scrap.status === 'available' ? (
                    <>
                      <button
                        className="btn-primary btn-lg"
                        style={{ flex: 1 }}
                        onClick={handleContactClick}
                        disabled={startingChat}
                      >
                        {startingChat ? 'Starting Chat...' : '💬 Contact Seller'}
                      </button>
                      <button
                        className="btn-secondary btn-lg"
                        style={{ flex: 1, borderColor: '#16A34A', color: '#16A34A' }}
                        onClick={handleContactClick}
                        disabled={startingChat}
                      >
                        🏷️ Make Offer
                      </button>
                    </>
                  ) : scrap.status === 'reserved' ? (
                    <div className="alert-warning" style={{ width: '100%', textAlign: 'center', margin: 0 }}>
                      🟠 Listing Reserved — Negotiation in progress with active buyer.
                    </div>
                  ) : (
                    <div className="alert-success" style={{ width: '100%', textAlign: 'center', margin: 0, background: '#F1F5F9', color: '#64748B', borderColor: '#CBD5E1' }}>
                      ✓ Listing Sold
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BuyerScrapDetailPage;
