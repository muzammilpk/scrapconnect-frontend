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

  const [startingChat, setStartingChat] = useState(false);

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
                      <p>No Photo Provided</p>
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

              {/* Right Column: Listing & Seller Info */}
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
                    <div className="banner-label">Quantity Available</div>
                    <div className="banner-value">
                      {scrap.estimatedWeight} {scrap.weightUnit || 'kg'}
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="detail-section">
                  <h4 className="section-heading">📍 Location</h4>
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

                {/* Contact Seller Action Button */}
                <div className="contact-seller-action-row">
                  <button
                    className="btn-primary btn-lg btn-full"
                    onClick={handleContactClick}
                    disabled={startingChat}
                  >
                    {startingChat ? 'Starting Chat...' : '💬 Contact Seller'}
                  </button>
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
