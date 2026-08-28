import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-brand" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
          <span>🛡️</span> ScrapConnect Admin
        </div>
      </div>

      <div className="admin-user-profile-summary">
        <div className="admin-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : '👑'}
        </div>
        <div>
          <div className="admin-name">{user?.name}</div>
          <span className="admin-role-badge">Super Admin 🛡️</span>
        </div>
      </div>

      <nav className="admin-nav-menu">
        <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👥</span> Users Management
        </NavLink>
        <NavLink to="/admin/scraps" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📦</span> Scrap Listings
        </NavLink>
        <NavLink to="/admin/deals" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🤝</span> Deals & Transactions
        </NavLink>
        <NavLink to="/admin/reviews" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⭐</span> Reviews & Ratings
        </NavLink>
        <NavLink to="/admin/reports" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🚩</span> User Reports
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <button className="btn-logout-full" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
