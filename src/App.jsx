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
import BrowseScrapPage from './pages/BrowseScrapPage';
import BuyerScrapDetailPage from './pages/BuyerScrapDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ConversationsPage from './pages/ConversationsPage';
import ChatPage from './pages/ChatPage';
import MyDealsPage from './pages/MyDealsPage';
import DealDetailsPage from './pages/DealDetailsPage';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminScrapsPage from './pages/AdminScrapsPage';
import AdminDealsPage from './pages/AdminDealsPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminReportsPage from './pages/AdminReportsPage';

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

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
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

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scraps"
            element={
              <AdminRoute>
                <AdminScrapsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/deals"
            element={
              <AdminRoute>
                <AdminDealsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminRoute>
                <AdminReviewsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReportsPage />
              </AdminRoute>
            }
          />

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
            path="/buyer/browse"
            element={
              <ProtectedRoute allowedRole="buyer">
                <BrowseScrapPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/scraps/:id"
            element={
              <ProtectedRoute allowedRole="buyer">
                <BuyerScrapDetailPage />
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

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <ConversationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/deals"
            element={
              <ProtectedRoute>
                <MyDealsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/deals/:id"
            element={
              <ProtectedRoute>
                <DealDetailsPage />
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
