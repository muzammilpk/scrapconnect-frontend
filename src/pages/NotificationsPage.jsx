import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';
import { getSocket } from '../services/socketService';

function NotificationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async (targetPage = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getNotifications(targetPage, 10);
      if (res.success) {
        setNotifications(res.notifications || []);
        setTotalPages(res.pagination?.totalPages || res.totalPages || 1);
        setPage(res.pagination?.page || res.page || 1);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);

    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification:new', handleNewNotification);
      return () => socket.off('notification:new', handleNewNotification);
    }
  }, []);

  const handleMarkAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.markNotificationAsRead(notificationId);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markAllNotificationsAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        setSuccessMsg('All notifications marked as read.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to mark all as read.');
    }
  };

  const handleDelete = async (notificationId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.deleteNotification(notificationId);
      if (res.success) {
        const deletedNotif = notifications.find((n) => n._id === notificationId);
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete notification.');
    }
  };

  const handleNotificationClick = async (notification) => {
    // 1. Mark read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // 2. Smart navigation based on notification type and refs
    if (notification.scrap) {
      const scrapId = typeof notification.scrap === 'object' ? notification.scrap._id : notification.scrap;
      navigate(user?.role === 'buyer' ? `/buyer/scraps/${scrapId}` : `/seller/scraps/${scrapId}`);
    } else if (notification.type === 'NEW_MESSAGE' || notification.type?.startsWith('OFFER_')) {
      navigate('/conversations');
    } else if (notification.type === 'DEAL_UPDATE' || notification.type === 'REVIEW_REQUEST') {
      navigate('/deals');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'NEW_SCRAP':
      case 'new_scrap_nearby':
        return '📦';
      case 'NEW_MESSAGE':
        return '💬';
      case 'OFFER_RECEIVED':
      case 'OFFER_ACCEPTED':
      case 'OFFER_REJECTED':
        return '💰';
      case 'DEAL_UPDATE':
        return '🤝';
      case 'REVIEW_REQUEST':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div
          className="navbar-brand"
          onClick={() => navigate(user?.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          {user?.role === 'buyer' && (
            <button className="btn-secondary" onClick={() => navigate('/buyer/browse')}>
              🔍 Browse Scrap
            </button>
          )}
          <NotificationBell />
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className="role-tag">{user?.role === 'buyer' ? 'Buyer 🛒' : 'Seller ♻️'}</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="notifications-header">
          <div>
            <h1>Notifications 🔔</h1>
            <p className="welcome-sub">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
                : 'All caught up! No unread notifications.'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={handleMarkAllRead}>
              ✓ Mark All as Read
            </button>
          )}
        </div>

        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
        {successMsg && <div className="alert-success">✅ {successMsg}</div>}

        {loading ? (
          <div className="loading-card">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-regions-card">
            <div className="empty-icon">🔔</div>
            <h3>No Notifications Yet</h3>
            <p>You will receive notifications when new scrap listings match your saved service regions.</p>
            {user?.role === 'buyer' && (
              <button
                className="btn-primary"
                onClick={() => navigate('/buyer/service-regions')}
                style={{ marginTop: '1.25rem', width: 'auto', display: 'inline-flex' }}
              >
                📍 Manage Service Regions
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => {
              const scrapObj = typeof notif.scrap === 'object' ? notif.scrap : null;
              return (
                <div
                  key={notif._id}
                  className={`notification-card ${!notif.isRead ? 'unread' : 'read'}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-icon-col">
                    <div className={`notif-icon-badge ${!notif.isRead ? 'unread' : ''}`}>
                      {getNotifIcon(notif.type)}
                    </div>
                  </div>

                  <div className="notif-content-col">
                    <div className="notif-title-row">
                      <h4 className="notif-title">{notif.title}</h4>
                      <span className="notif-time">{formatDate(notif.createdAt)}</span>
                    </div>

                    <p className="notif-message">{notif.message}</p>

                    {scrapObj && (
                      <div className="notif-scrap-preview">
                        <span className="preview-chip">{scrapObj.category}</span>
                        <span className="preview-location">
                          📍 {scrapObj.location?.city}, {scrapObj.location?.district}
                        </span>
                        {scrapObj.estimatedWeight && (
                          <span className="preview-weight">
                            ⚖️ {scrapObj.estimatedWeight} {scrapObj.weightUnit || 'kg'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="notif-actions-col">
                    {!notif.isRead && (
                      <button
                        className="btn-link-sm"
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        title="Mark as read"
                      >
                        ✓ Read
                      </button>
                    )}
                    <button
                      className="btn-danger-link"
                      onClick={(e) => handleDelete(notif._id, e)}
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => fetchNotifications(page - 1)}
                  disabled={page <= 1}
                >
                  ← Previous
                </button>

                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>

                <button
                  className="pagination-btn"
                  onClick={() => fetchNotifications(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default NotificationsPage;
