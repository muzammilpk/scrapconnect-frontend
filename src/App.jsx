import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import ProfilePage from './pages/ProfilePage';
import ServiceRegionsPage from './pages/ServiceRegionsPage';
import AddScrapPage from './pages/AddScrapPage';
import MyScrapListingsPage from './pages/MyScrapListingsPage';
import ScrapDetailPage from './pages/ScrapDetailPage';
import EditScrapPage from './pages/EditScrapPage';
import ProtectedRoute from './components/ProtectedRoute';

function HomeRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="status-pill">Loading ScrapConnect...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/service-regions"
            element={
              <ProtectedRoute allowedRole="buyer">
                <ServiceRegionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/add-scrap"
            element={
              <ProtectedRoute allowedRole="seller">
                <AddScrapPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/scraps"
            element={
              <ProtectedRoute allowedRole="seller">
                <MyScrapListingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/scraps/:id"
            element={
              <ProtectedRoute allowedRole="seller">
                <ScrapDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/scraps/:id/edit"
            element={
              <ProtectedRoute allowedRole="seller">
                <EditScrapPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
