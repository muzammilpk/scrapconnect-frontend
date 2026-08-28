import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="status-pill">Verifying Admin Privileges...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="empty-regions-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="empty-icon" style={{ fontSize: '3.5rem' }}>🛡️</div>
          <h2 style={{ color: '#DC2626', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p>You do not have administrator permissions to view this area.</p>
          <button
            className="btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => window.location.href = '/'}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
