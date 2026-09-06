import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import usePageTitle from '../hooks/usePageTitle';

function ForgotPasswordPage() {
  usePageTitle('Forgot Password');
  const navigate = useNavigate();

  // Step 1: Request reset code, Step 2: Enter token & new password
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [devTokenHint, setDevTokenHint] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Step 1: Request Password Reset Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email or mobile number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.forgotPassword(identifier.trim());
      setSuccessMsg(res.message || 'Password reset code has been sent.');

      if (res.resetToken) {
        setDevTokenHint(res.resetToken);
        setResetToken(res.resetToken);
      }

      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reset code. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetToken.trim()) {
      setErrorMsg('Please enter the 6-digit reset code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.resetPassword({
        identifier: identifier.trim(),
        resetToken: resetToken.trim(),
        newPassword,
      });

      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-auth-card">
        <div className="brand-header">
          <div className="brand-logo">
            <span className="brand-logo-icon">🔑</span>
            ScrapConnect
          </div>
          <p className="brand-tagline">Account Recovery</p>
        </div>

        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
        </h2>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        {devTokenHint && step === 2 && (
          <div className="dev-token-banner">
            <span className="dev-token-badge">Dev Code</span>
            <strong>{devTokenHint}</strong>
            <p style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: '#15803D' }}>
              (Auto-filled for testing convenience)
            </p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginBottom: '1.25rem', textAlign: 'center' }}>
              Enter the email address or mobile number associated with your ScrapConnect account to receive a reset code.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="identifier">
                Email or Mobile Number
              </label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input
                  id="identifier"
                  type="text"
                  className="form-input icon-padded"
                  placeholder="e.g. user@example.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending Reset Code...' : 'Get Reset Code 📩'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginBottom: '1.25rem', textAlign: 'center' }}>
              Enter the reset code sent to <strong>{identifier}</strong> and choose a new password.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="resetToken">
                6-Digit Reset Code
              </label>
              <input
                id="resetToken"
                type="text"
                className="form-input token-input"
                placeholder="Enter 6-digit code"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting Password...' : 'Set New Password 🔐'}
            </button>

            <button
              type="button"
              className="btn-secondary-link"
              onClick={() => setStep(1)}
              style={{ marginTop: '0.75rem', width: '100%', textAlign: 'center' }}
            >
              ← Back to enter email/mobile
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
