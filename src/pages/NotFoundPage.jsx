import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';

function NotFoundPage() {
  usePageTitle('Page Not Found');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGoHome = () => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (user?.role === 'buyer') {
      navigate('/buyer/dashboard');
    } else if (user?.role === 'seller') {
      navigate('/seller/dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="not-found-main">
        <div className="not-found-card">
          <div className="not-found-code">404</div>
          <h1 className="not-found-title">Page not found.</h1>
          <p className="not-found-desc">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <button className="btn-primary btn-lg" onClick={handleGoHome}>
            🏠 Go Home
          </button>
        </div>
      </main>
    </div>
  );
}

export default NotFoundPage;
