import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getUnreadNotificationCount();
      if (res.success) {
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail for background polling
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchUnreadCount();

    // Polling every 30 seconds for background updates
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  return (
    <button
      className="btn-notification-bell"
      onClick={() => navigate('/notifications')}
      title="View Notifications"
    >
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
  );
}

export default NotificationBell;
