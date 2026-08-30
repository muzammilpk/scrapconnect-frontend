import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getSocket } from '../services/socketService';

function NotificationBell() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  // Format relative timestamp
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
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

  const fetchUnreadAndRecent = async () => {
    if (!isAuthenticated) return;
    try {
      const [countRes, notifRes] = await Promise.all([
        api.getUnreadNotificationCount(),
        api.getNotifications(1, 5),
      ]);

      if (countRes?.success) {
        setUnreadCount(countRes.count ?? countRes.unreadCount ?? 0);
      }
      if (notifRes?.success) {
        setRecentNotifications(notifRes.notifications || []);
      }
    } catch (err) {
      // Quiet background failure
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadAndRecent();

    // Socket.IO Real-time notification listener
    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (newNotif) => {
        setUnreadCount((prev) => prev + 1);
        setRecentNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
      };

      socket.on('notification:new', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [isAuthenticated]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.markAllNotificationsAsRead();
      if (res.success) {
        setUnreadCount(0);
        setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err.message);
    }
  };

  const handleItemClick = async (notif) => {
    setDropdownOpen(false);

    if (!notif.isRead) {
      try {
        await api.markNotificationAsRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setRecentNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }

    // Smart navigation based on notification type
    if (notif.scrap) {
      const scrapId = typeof notif.scrap === 'object' ? notif.scrap._id : notif.scrap;
      navigate(user?.role === 'buyer' ? `/buyer/scraps/${scrapId}` : `/seller/scraps/${scrapId}`);
    } else if (notif.type === 'NEW_MESSAGE' || notif.type?.startsWith('OFFER_')) {
      navigate('/conversations');
    } else if (notif.type === 'DEAL_UPDATE' || notif.type === 'REVIEW_REQUEST') {
      navigate('/deals');
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="btn-notification-bell"
        onClick={() => setDropdownOpen((prev) => !prev)}
        title="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {dropdownOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4 className="dropdown-title">Notifications 🔔</h4>
            {unreadCount > 0 && (
              <button className="btn-link-xs" onClick={handleMarkAllRead}>
                ✓ Mark all read
              </button>
            )}
          </div>

          <div className="dropdown-body">
            {recentNotifications.length === 0 ? (
              <div className="dropdown-empty">
                <span style={{ fontSize: '1.5rem' }}>🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`dropdown-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <span className="dropdown-item-icon">{getNotificationIcon(notif.type)}</span>
                  <div className="dropdown-item-content">
                    <div className="dropdown-item-title-row">
                      <span className="dropdown-item-title">{notif.title}</span>
                      <span className="dropdown-item-time">{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                    <p className="dropdown-item-msg">{notif.message}</p>
                  </div>
                  {!notif.isRead && <span className="unread-dot" title="Unread" />}
                </div>
              ))
            )}
          </div>

          <div className="dropdown-footer">
            <button
              className="btn-dropdown-view-all"
              onClick={() => {
                setDropdownOpen(false);
                navigate('/notifications');
              }}
            >
              View All Notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
