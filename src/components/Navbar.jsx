import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="main-navbar">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <Link to={isAuthenticated ? (user?.role === 'buyer' ? '/buyer/dashboard' : user?.role === 'seller' ? '/seller/dashboard' : '/admin') : '/'} className="navbar-brand-link">
          <span className="brand-logo-icon">♻️</span>
          <span className="brand-title">ScrapConnect</span>
        </Link>

        {/* Desktop Links */}
        <nav className="desktop-nav-menu">
          {isAuthenticated ? (
            <>
              {user?.role === 'buyer' && (
                <>
                  <button
                    className={`nav-btn ${isLinkActive('/buyer/dashboard') ? 'active' : ''}`}
                    onClick={() => navigate('/buyer/dashboard')}
                  >
                    📊 Dashboard
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/buyer/browse') ? 'active' : ''}`}
                    onClick={() => navigate('/buyer/browse')}
                  >
                    🔍 Marketplace
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/buyer/service-regions') ? 'active' : ''}`}
                    onClick={() => navigate('/buyer/service-regions')}
                  >
                    📍 Service Regions
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/conversations') ? 'active' : ''}`}
                    onClick={() => navigate('/conversations')}
                  >
                    💬 Messages
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/deals') ? 'active' : ''}`}
                    onClick={() => navigate('/deals')}
                  >
                    🤝 Deals
                  </button>
                </>
              )}

              {user?.role === 'seller' && (
                <>
                  <button
                    className={`nav-btn ${isLinkActive('/seller/dashboard') ? 'active' : ''}`}
                    onClick={() => navigate('/seller/dashboard')}
                  >
                    📊 Dashboard
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/seller/scraps') ? 'active' : ''}`}
                    onClick={() => navigate('/seller/scraps')}
                  >
                    📦 My Listings
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/seller/add-scrap') ? 'active' : ''}`}
                    onClick={() => navigate('/seller/add-scrap')}
                  >
                    ➕ Add Scrap
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/conversations') ? 'active' : ''}`}
                    onClick={() => navigate('/conversations')}
                  >
                    💬 Messages
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/deals') ? 'active' : ''}`}
                    onClick={() => navigate('/deals')}
                  >
                    🤝 Deals
                  </button>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <button
                    className={`nav-btn ${isLinkActive('/admin') ? 'active' : ''}`}
                    onClick={() => navigate('/admin')}
                  >
                    🛡️ Admin
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/admin/users') ? 'active' : ''}`}
                    onClick={() => navigate('/admin/users')}
                  >
                    👥 Users
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/admin/scraps') ? 'active' : ''}`}
                    onClick={() => navigate('/admin/scraps')}
                  >
                    📦 Listings
                  </button>
                  <button
                    className={`nav-btn ${isLinkActive('/admin/deals') ? 'active' : ''}`}
                    onClick={() => navigate('/admin/deals')}
                  >
                    🤝 Deals
                  </button>
                </>
              )}

              {/* Notification Bell */}
              <div className="navbar-notif-wrapper">
                <NotificationBell />
              </div>

              {/* Profile button */}
              <button
                className={`nav-btn profile-nav-btn ${isLinkActive('/profile') ? 'active' : ''}`}
                onClick={() => navigate('/profile')}
              >
                👤 {user?.name?.split(' ')[0] || 'Profile'}
              </button>

              {/* Logout button */}
              <button className="btn-logout-nav" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={() => navigate('/')}>
                Home
              </button>
              <button className="btn-secondary nav-link-btn" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn-primary nav-link-btn" onClick={() => navigate('/register')}>
                Get Started
              </button>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="mobile-nav-toggle-wrapper">
          {isAuthenticated && (
            <div className="mobile-notif-bell">
              <NotificationBell />
            </div>
          )}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="brand-logo-icon">♻️</span>
              <span className="brand-title">ScrapConnect</span>
              <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                ✕
              </button>
            </div>

            {isAuthenticated ? (
              <div className="mobile-user-profile-summary">
                <div className="user-avatar-sm">{user?.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="mobile-user-name">{user?.name}</div>
                  <span className="role-tag-sm">{user?.role?.toUpperCase()}</span>
                </div>
              </div>
            ) : null}

            <nav className="mobile-nav-links">
              {isAuthenticated ? (
                <>
                  {user?.role === 'buyer' && (
                    <>
                      <button className="mobile-nav-link" onClick={() => navigate('/buyer/dashboard')}>
                        📊 Dashboard
                      </button>
                      <button className="mobile-nav-link" onClick={() => navigate('/buyer/browse')}>
                        🔍 Marketplace
                      </button>
                      <button className="mobile-nav-link" onClick={() => navigate('/buyer/service-regions')}>
                        📍 Service Regions
                      </button>
                    </>
                  )}

                  {user?.role === 'seller' && (
                    <>
                      <button className="mobile-nav-link" onClick={() => navigate('/seller/dashboard')}>
                        📊 Dashboard
                      </button>
                      <button className="mobile-nav-link" onClick={() => navigate('/seller/scraps')}>
                        📦 My Listings
                      </button>
                      <button className="mobile-nav-link" onClick={() => navigate('/seller/add-scrap')}>
                        ➕ Add Scrap
                      </button>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <button className="mobile-nav-link" onClick={() => navigate('/admin')}>
                        🛡️ Admin Overview
                      </button>
                      <button className="mobile-nav-link" onClick={() => navigate('/admin/users')}>
                        👥 Users Management
                      </button>
                      <button className="mobile-nav-link" onClick={() => navigate('/admin/scraps')}>
                        📦 Listings Management
                      </button>
                    </>
                  )}

                  <button className="mobile-nav-link" onClick={() => navigate('/conversations')}>
                    💬 Messages & Offers
                  </button>
                  <button className="mobile-nav-link" onClick={() => navigate('/deals')}>
                    🤝 Deals History
                  </button>
                  <button className="mobile-nav-link" onClick={() => navigate('/notifications')}>
                    🔔 Notifications
                  </button>
                  <button className="mobile-nav-link" onClick={() => navigate('/profile')}>
                    👤 Account Profile
                  </button>

                  <div className="mobile-drawer-footer">
                    <button className="btn-danger btn-full" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button className="mobile-nav-link" onClick={() => navigate('/')}>
                    🏠 Home
                  </button>
                  <button className="mobile-nav-link" onClick={() => navigate('/login')}>
                    🔑 Sign In
                  </button>
                  <button className="btn-primary btn-full" onClick={() => navigate('/register')}>
                    ✨ Create Account
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
