import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Account Deactivation Modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (!passData.currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    setPassSubmitting(true);
    try {
      const res = await api.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
        confirmPassword: passData.confirmPassword,
      });

      if (res.success) {
        setPassSuccess('✓ Password updated successfully!');
        setPassData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setPassError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPassSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    setDeactivateError('');
    try {
      const res = await api.deactivateAccount();
      if (res.success) {
        logout();
        navigate('/login', { state: { infoMsg: 'Your account has been deactivated.' } });
      }
    } catch (err) {
      setDeactivateError(err.message || 'Failed to deactivate account.');
      setDeactivating(false);
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
            👤 Profile
          </button>
          <button className="btn-secondary" onClick={handleDashboardNav}>
            ← Dashboard
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
            <h1 className="welcome-title">Account Settings</h1>
            <p className="welcome-sub">Manage your security credentials and account status</p>
          </div>

          {/* SECTION 1: ACCOUNT OVERVIEW */}
          <div className="form-section-card">
            <h3 className="section-card-title">🔐 Account Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input read-only-input"
                  value={user?.email || 'No email attached'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input read-only-input"
                  value={user?.mobileNumber || 'No phone attached'}
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <input
                  type="text"
                  className="form-input read-only-input text-capitalize"
                  value={user?.role || ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <input
                  type="text"
                  className="form-input read-only-input text-capitalize"
                  value={user?.status || 'Active'}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CHANGE PASSWORD */}
          <div className="form-section-card">
            <h3 className="section-card-title">🔑 Change Password</h3>

            {passSuccess && <div className="alert-success">{passSuccess}</div>}
            {passError && <div className="alert-error">⚠️ {passError}</div>}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword">
                  Current Password <span className="required-star">*</span>
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  className="form-input"
                  value={passData.currentPassword}
                  onChange={handlePassChange}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="newPassword">
                    New Password <span className="required-star">*</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    className="form-input"
                    value={passData.newPassword}
                    onChange={handlePassChange}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm New Password <span className="required-star">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    value={passData.confirmPassword}
                    onChange={handlePassChange}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <div className="form-actions-bar" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={passSubmitting}>
                  {passSubmitting ? 'Updating Password...' : '🔑 Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 3: ACCOUNT DEACTIVATION */}
          <div className="form-section-card alert-error-box" style={{ textAlign: 'left' }}>
            <h3 className="section-card-title" style={{ color: '#DC2626' }}>⚠️ Danger Zone</h3>
            <p className="detail-text" style={{ marginBottom: '1rem' }}>
              Deactivating your account will suspend access to your ScrapConnect profile. Your historical completed deals and reviews will remain safely recorded for transaction integrity.
            </p>
            <button
              type="button"
              className="btn-danger"
              onClick={() => setShowDeactivateModal(true)}
            >
              🚫 Deactivate Account
            </button>
          </div>
        </div>
      </main>

      {/* DEACTIVATION CONFIRMATION MODAL */}
      {showDeactivateModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-confirm">
            <div className="modal-header">
              <h3>⚠️ Confirm Account Deactivation</h3>
            </div>
            <div className="modal-body">
              {deactivateError && <div className="alert-error">⚠️ {deactivateError}</div>}
              <p>Are you sure you want to deactivate your ScrapConnect account? You will be logged out immediately.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDeactivate} disabled={deactivating}>
                {deactivating ? 'Deactivating...' : 'Yes, Deactivate Account'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
                disabled={deactivating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountSettingsPage;
