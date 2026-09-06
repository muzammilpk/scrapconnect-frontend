import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

function RegisterPage() {
  usePageTitle('Register');
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'buyer' ? 'buyer' : 'seller';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!mobileNumber.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }

    const mobileRegex = /^[0-9+\s-]{10,15}$/;
    if (!mobileRegex.test(mobileNumber.trim())) {
      setErrorMsg('Please enter a valid mobile number (10 to 15 digits).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        password,
        role,
      });

      // Redirect based on selected user role
      if (user?.role === 'buyer') {
        navigate('/buyer/dashboard', { replace: true });
      } else {
        navigate('/seller/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-auth-card">
        <div className="brand-header">
          <div className="brand-logo">
            <span className="brand-logo-icon">♻️</span>
            ScrapConnect
          </div>
          <p className="brand-tagline">Create Your Account</p>
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role Selector Cards */}
          <div className="form-group">
            <label className="role-selection-label">Select Account Type</label>
            <div className="role-grid">
              <div
                className={`role-card ${role === 'seller' ? 'active' : ''}`}
                onClick={() => setRole('seller')}
              >
                <div className="role-icon">♻️</div>
                <div className="role-title">Seller</div>
                <div className="role-subtitle">Sell household or commercial scrap</div>
              </div>

              <div
                className={`role-card ${role === 'buyer' ? 'active' : ''}`}
                onClick={() => setRole('buyer')}
              >
                <div className="role-icon">🛒</div>
                <div className="role-title">Buyer</div>
                <div className="role-subtitle">Collect and purchase scrap items</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="name"
                type="text"
                className="form-input icon-padded"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                id="email"
                type="email"
                className="form-input icon-padded"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mobileNumber">
              Mobile Number <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">📞</span>
              <input
                id="mobileNumber"
                type="tel"
                className="form-input icon-padded"
                placeholder="10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : `Register as ${role === 'seller' ? 'Seller ♻️' : 'Buyer 🛒'}`}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

