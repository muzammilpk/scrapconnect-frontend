import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function EditProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    profileImage: user?.profileImage || '',
    address: user?.address || '',
    state: user?.location?.state || '',
    district: user?.location?.district || '',
    city: user?.location?.city || '',
    area: user?.location?.area || '',
    pincode: user?.location?.pincode || '',
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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

      const res = await api.updateProfile(payload);
      if (res.success) {
        if (updateProfile) {
          await updateProfile(payload);
        }
        setSuccessMsg('✓ Profile updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDashboardNav = () => {
    if (user?.role === 'buyer') {
      navigate('/buyer/dashboard');
    } else if (user?.role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={handleDashboardNav} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            ← Back to Profile
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className="role-tag">{user?.role?.toUpperCase()}</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="form-page-container" style={{ maxWidth: '800px' }}>
          <div className="form-header">
            <h1 className="welcome-title">Edit Profile</h1>
            <p className="welcome-sub">Update your personal contact and location information</p>
          </div>

          {successMsg && <div className="alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="form-section-card">
              <h3 className="section-card-title">👤 Personal Details</h3>

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
                <label className="form-label">Email Address (Authentication Credential)</label>
                <input
                  type="email"
                  className="form-input read-only-input"
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            {/* SECTION 2: LOCATION INFORMATION */}
            <div className="form-section-card">
              <h3 className="section-card-title">📍 Location Details</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  Street Address / House No. (Optional)
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
                    placeholder="e.g. Town Center"
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
                    placeholder="e.g. Pala"
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
                    placeholder="e.g. 686575"
                  />
                </div>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="form-actions-bar">
              <button type="submit" className="btn-primary btn-lg" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button
                type="button"
                className="btn-secondary btn-lg"
                onClick={() => navigate('/profile')}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditProfilePage;
