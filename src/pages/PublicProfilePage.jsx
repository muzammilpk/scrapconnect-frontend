import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ScrapCard from '../components/ScrapCard';

function PublicProfilePage() {
  usePageTitle('Public Profile');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const [profRes, revRes] = await Promise.all([
          api.getPublicProfile(id),
          api.getUserReviews(id),
        ]);

        if (profRes.success && (profRes.profile || profRes.user)) {
          const profData = profRes.profile || profRes.user;
          setProfile(profData);

          // If profile belongs to a seller, fetch their active scrap listings
          if (profData.role === 'seller') {
            try {
              const listRes = await api.getPublicSellerListings(id);
              if (listRes.success) {
                setActiveListings(listRes.scraps || listRes.data || []);
              }
            } catch (lErr) {
              console.error('Failed to fetch seller listings:', lErr.message);
            }
          }
        }

        if (revRes.success) {
          setReviews(revRes.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load public profile:', err.message);
        setErrorMsg('Unable to load public profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  const handleDashboardNav = () => {
    if (user?.role === 'buyer') {
      navigate('/buyer/dashboard');
    } else if (user?.role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        {loading ? (
          <div className="loading-card">Loading user profile...</div>
        ) : errorMsg || !profile ? (
          <div className="empty-listings-card alert-error-box">
            <div className="empty-icon">⚠️</div>
            <h3>{errorMsg || 'User profile not found.'}</h3>
            <button className="btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
              Go Back
            </button>
          </div>
        ) : (
          <div className="profile-wrapper">
            {/* Header Card */}
            <div className="profile-header-card">
              <div className="profile-avatar-container">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="profile-avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="profile-avatar-placeholder"
                  style={{ display: profile.profileImage ? 'none' : 'flex' }}
                >
                  {getAvatarInitials(profile.name)}
                </div>
              </div>

              <div className="profile-header-info">
                <h1 className="profile-user-name">{profile.name}</h1>
                <div className="profile-meta-tags">
                  <span className="meta-badge role">
                    {profile.role === 'seller' ? 'Seller ♻️' : 'Buyer 🛒'}
                  </span>
                  {profile.location && (profile.location.city || profile.location.district) && (
                    <span className="meta-badge location">
                      📍 {profile.location.city ? `${profile.location.city}, ` : ''}{profile.location.district}
                    </span>
                  )}
                  <span className="meta-badge rating-badge">
                    {profile.reviewCount > 0 ? (
                      <>⭐ {profile.rating} / 5 ({profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''})</>
                    ) : (
                      <>⭐ New Member</>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* PUBLIC PROFILE METRICS GRID */}
            <div className="buyer-dashboard-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="buyer-summary-card">
                <div className="summary-card-header">
                  <div>
                    <h3 className="summary-card-title">Completed Deals</h3>
                    <p className="summary-card-sub">Successfully finalized scrap transactions</p>
                  </div>
                </div>
                <div className="summary-card-body">
                  <div className="summary-stat-large">
                    🤝 {profile.completedDeals} Deal{profile.completedDeals !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="buyer-summary-card">
                <div className="summary-card-header">
                  <div>
                    <h3 className="summary-card-title">Reputation & Rating</h3>
                    <p className="summary-card-sub">Feedback score from community members</p>
                  </div>
                </div>
                <div className="summary-card-body">
                  <div className="summary-stat-large">
                    <StarRating rating={profile.rating || 0} readOnly size="md" />
                    <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>({profile.reviewCount})</span>
                  </div>
                </div>
              </div>

              {profile.role === 'seller' && (
                <div className="buyer-summary-card highlight-card">
                  <div className="summary-card-header">
                    <div>
                      <h3 className="summary-card-title">Active Scrap Listings</h3>
                      <p className="summary-card-sub">Available materials listed for sale</p>
                    </div>
                  </div>
                  <div className="summary-card-body">
                    <div className="summary-stat-large">
                      📦 {activeListings.length} Listing{activeListings.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SELLER ACTIVE LISTINGS GRID (If Seller) */}
            {profile.role === 'seller' && (
              <div className="profile-card full-width-card" style={{ marginBottom: '1.5rem' }}>
                <h3 className="card-title">📦 Active Scrap Listings by {profile.name}</h3>

                {activeListings.length === 0 ? (
                  <div className="summary-empty" style={{ padding: '1.5rem 0' }}>
                    No active scrap listings currently published by this seller.
                  </div>
                ) : (
                  <div className="scraps-grid" style={{ marginTop: '1rem' }}>
                    {activeListings.map((scrap) => (
                      <ScrapCard key={scrap._id} scrap={scrap} detailPath={`/buyer/scraps/${scrap._id}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS & FEEDBACK LIST */}
            <div className="profile-card full-width-card">
              <h3 className="card-title">⭐ Community Feedback for {profile.name}</h3>
              <ReviewList reviews={reviews} currentUserId={user?._id} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicProfilePage;
