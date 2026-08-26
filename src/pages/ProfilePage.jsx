import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import api from '../services/api';

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Rating & Review state
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [receivedReviews, setReceivedReviews] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    profileImage: '',
    address: '',
    state: '',
    district: '',
    city: '',
    area: '',
    pincode: '',
  });

  // Populate form data from logged-in user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobileNumber: user.mobileNumber || '',
        profileImage: user.profileImage || '',
        address: user.address || '',
        state: user.location?.state || '',
        district: user.location?.district || '',
        city: user.location?.city || '',
        area: user.location?.area || '',
        pincode: user.location?.pincode || '',
      });
    }
  }, [user]);

  // Fetch latest profile, rating summary, and reviews
  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const [profRes, ratingRes, revRes] = await Promise.all([
          api.getProfile(),
          api.getUserRatingSummary(user._id),
          api.getUserReviews(user._id),
        ]);

        if (profRes.success && profRes.user) {
          setFormData({
            name: profRes.user.name || '',
            mobileNumber: profRes.user.mobileNumber || '',
            profileImage: profRes.user.profileImage || '',
            address: profRes.user.address || '',
            state: profRes.user.location?.state || '',
            district: profRes.user.location?.district || '',
            city: profRes.user.location?.city || '',
            area: profRes.user.location?.area || '',
            pincode: profRes.user.location?.pincode || '',
          });
        }

        if (ratingRes.success) {
          setRatingSummary({
            averageRating: ratingRes.averageRating || 0,
            totalReviews: ratingRes.totalReviews || 0,
            distribution: ratingRes.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          });
        }

        if (revRes.success) {
          setReceivedReviews(revRes.reviews || []);
        }
      } catch (err) {
        console.error('Failed to fetch profile/reviews:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndReviews();
  }, [user?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Name is required');
      return;
    }

    if (formData.mobileNumber.trim()) {
      const mobileRegex = /^[0-9]{10,15}$/;
      if (!mobileRegex.test(formData.mobileNumber.trim())) {
        setErrorMsg('Please enter a valid mobile number (10 to 15 digits)');
        return;
      }
    }

    if (formData.pincode.trim()) {
      const pincodeRegex = /^[0-9]{5,10}$/;
      if (!pincodeRegex.test(formData.pincode.trim())) {
        setErrorMsg('Please enter a valid pincode (5 to 10 digits)');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim() || undefined,
        profileImage: formData.profileImage.trim(),
        address: formData.address.trim(),
        location: {
          state: formData.state.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      await updateProfile(payload);
      setSuccessMsg('Profile and location updated successfully!');
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDashboardNav = () => {
    if (user?.role === 'buyer') {
      navigate('/buyer/dashboard');
    } else {
      navigate('/seller/dashboard');
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
      <header className="navbar">
        <div className="navbar-brand" onClick={handleDashboardNav} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={handleDashboardNav}>
            ← Dashboard
          </button>
          {user?.role === 'buyer' && (
            <>
              <button className="btn-secondary nav-link-btn" onClick={() => navigate('/buyer/browse')}>
                🔍 Browse Scrap
              </button>
              <button className="btn-secondary nav-link-btn" onClick={() => navigate('/buyer/service-regions')}>
                📍 Service Regions
              </button>
            </>
          )}
          {user?.role === 'seller' && (
            <>
              <button className="btn-secondary nav-link-btn" onClick={() => navigate('/seller/scraps')}>
                📦 My Listings
              </button>
              <button className="btn-secondary nav-link-btn" onClick={() => navigate('/seller/add-scrap')}>
                ➕ Add Scrap
              </button>
            </>
          )}
          <button className="btn-secondary nav-link-btn" onClick={() => navigate('/deals')}>
            🤝 My Deals
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className={`role-tag ${user?.role}`}>
              {user?.role === 'buyer' ? 'Buyer 🛒' : 'Seller ♻️'}
            </span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Profile Content */}
      <main className="dashboard-content">
        {/* Banner Alert Messages */}
        {successMsg && <div className="alert-success">✅ {successMsg}</div>}
        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

        <div className="profile-wrapper">
          {/* Header Card */}
          <div className="profile-header-card">
            <div className="profile-avatar-container">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="profile-avatar-placeholder"
                style={{ display: user?.profileImage ? 'none' : 'flex' }}
              >
                {getAvatarInitials(user?.name)}
              </div>
            </div>

            <div className="profile-header-info">
              <h1 className="profile-user-name">{user?.name}</h1>
              <p className="profile-user-email">📧 {user?.email || 'No email provided'}</p>
              <div className="profile-meta-tags">
                <span className="meta-badge role">
                  Role: <strong>{user?.role?.toUpperCase()}</strong>
                </span>
                {user?.mobileNumber && (
                  <span className="meta-badge mobile">📞 {user.mobileNumber}</span>
                )}
                <span className="meta-badge rating-badge">
                  {ratingSummary.totalReviews > 0 ? (
                    <>⭐ {ratingSummary.averageRating} / 5 ({ratingSummary.totalReviews} reviews)</>
                  ) : (
                    <>⭐ No reviews yet</>
                  )}
                </span>
              </div>
            </div>

            <div className="profile-action-area">
              {!isEditing ? (
                <button className="btn-primary edit-toggle-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <button
                  className="btn-secondary cancel-toggle-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMsg('');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-card">Loading profile data...</div>
          ) : !isEditing ? (
            /* VIEW PROFILE MODE */
            <div className="profile-details-grid">
              {/* Account Overview */}
              <div className="profile-card">
                <h3 className="card-title">👤 Account Overview</h3>
                <div className="info-group">
                  <label className="info-label">Full Name</label>
                  <div className="info-value">{user?.name || '—'}</div>
                </div>

                <div className="info-group">
                  <label className="info-label">Email Address</label>
                  <div className="info-value">{user?.email || '—'}</div>
                </div>

                <div className="info-group">
                  <label className="info-label">Mobile Number</label>
                  <div className="info-value">{user?.mobileNumber || 'Not specified'}</div>
                </div>

                <div className="info-group">
                  <label className="info-label">Account Role</label>
                  <div className="info-value text-capitalize">
                    <span className="role-chip">{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Saved Location Details */}
              <div className="profile-card">
                <h3 className="card-title">📍 Saved Location & Address</h3>

                <div className="info-group">
                  <label className="info-label">Street / House Address</label>
                  <div className="info-value">{user?.address || 'Not specified'}</div>
                </div>

                <div className="location-info-grid">
                  <div className="info-group">
                    <label className="info-label">Area / Locality</label>
                    <div className="info-value">{user?.location?.area || '—'}</div>
                  </div>

                  <div className="info-group">
                    <label className="info-label">City / Town</label>
                    <div className="info-value">{user?.location?.city || '—'}</div>
                  </div>

                  <div className="info-group">
                    <label className="info-label">District</label>
                    <div className="info-value">{user?.location?.district || '—'}</div>
                  </div>

                  <div className="info-group">
                    <label className="info-label">State</label>
                    <div className="info-value">{user?.location?.state || '—'}</div>
                  </div>

                  <div className="info-group">
                    <label className="info-label">Pincode</label>
                    <div className="info-value">{user?.location?.pincode || '—'}</div>
                  </div>
                </div>

                {(!user?.location?.city && !user?.location?.area) && (
                  <div className="empty-location-notice">
                    📌 You haven't added your location details yet. Click <strong>Edit Profile</strong> to set your city, area, and pincode.
                  </div>
                )}
              </div>

              {/* Reputation & Reviews Summary Section */}
              <div className="profile-card full-width-card">
                <h3 className="card-title">⭐ Reputation & Received Reviews</h3>

                {ratingSummary.totalReviews > 0 ? (
                  <div className="rating-summary-layout">
                    <div className="rating-score-box">
                      <div className="avg-rating-num">{ratingSummary.averageRating}</div>
                      <StarRating rating={ratingSummary.averageRating} readOnly size="lg" />
                      <div className="total-reviews-sub">Based on {ratingSummary.totalReviews} reviews</div>
                    </div>

                    <div className="rating-bars-box">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingSummary.distribution[stars] || 0;
                        const pct = ratingSummary.totalReviews > 0 ? (count / ratingSummary.totalReviews) * 100 : 0;

                        return (
                          <div key={stars} className="dist-row">
                            <span className="dist-star-label">{stars} ★</span>
                            <div className="dist-bar-track">
                              <div className="dist-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="dist-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="empty-reviews-notice">
                    ⭐ <strong>No reviews yet.</strong> Reviews will appear here once you complete transactions on ScrapConnect.
                  </div>
                )}

                <div className="received-reviews-container">
                  <h4 className="sub-section-title">Received Feedback</h4>
                  <ReviewList reviews={receivedReviews} currentUserId={user?._id} />
                </div>
              </div>
            </div>
          ) : (
            /* EDIT PROFILE MODE */
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="profile-card">
                <h3 className="card-title">✏️ Edit Personal Details</h3>

                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="mobileNumber">
                      Mobile Number
                    </label>
                    <input
                      id="mobileNumber"
                      type="text"
                      name="mobileNumber"
                      className="form-input"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profileImage">
                      Profile Image URL (Optional)
                    </label>
                    <input
                      id="profileImage"
                      type="url"
                      name="profileImage"
                      className="form-input"
                      value={formData.profileImage}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-input read-only-input"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>

              {/* LOCATION FORM SECTION */}
              <div className="profile-card">
                <h3 className="card-title">📍 Location Information</h3>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">
                    Street Address / House No.
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Green Street, Flat 4B"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="area">
                      Area / Locality
                    </label>
                    <input
                      id="area"
                      type="text"
                      name="area"
                      className="form-input"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="e.g. Jawahar Nagar"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="city">
                      City / Town
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Kottayam"
                    />
                  </div>
                </div>

                <div className="form-row three-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="district">
                      District
                    </label>
                    <input
                      id="district"
                      type="text"
                      name="district"
                      className="form-input"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Kottayam"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="state">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Kerala"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pincode">
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      name="pincode"
                      className="form-input"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 686001"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving Changes...' : '💾 Save Profile & Location'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
