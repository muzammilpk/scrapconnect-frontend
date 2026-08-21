import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';

function ConversationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchConversations = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const getOtherParticipant = (conv) => {
    if (!conv || !user) return { name: 'User', role: '' };
    const isBuyer = conv.buyer?._id === user._id || conv.buyer === user._id;
    return isBuyer ? conv.seller : conv.buyer;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <div className="conversations-header">
          <div>
            <h1>Messages 💬</h1>
            <p className="welcome-sub">Direct real-time communication with buyers and sellers</p>
          </div>
        </div>

        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

        {loading ? (
          <div className="loading-card">Loading messages...</div>
        ) : conversations.length === 0 ? (
          <div className="empty-regions-card">
            <div className="empty-icon">💬</div>
            <h3>No Conversations Yet</h3>
            <p>
              {user?.role === 'buyer'
                ? 'Browse scrap listings and click "Contact Seller" to start chatting.'
                : 'When buyers contact you regarding your scrap listings, messages will appear here.'}
            </p>
            {user?.role === 'buyer' && (
              <button
                className="btn-primary"
                onClick={() => navigate('/buyer/browse')}
                style={{ marginTop: '1.25rem', width: 'auto', display: 'inline-flex' }}
              >
                🔍 Browse Marketplace
              </button>
            )}
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => {
              const otherUser = getOtherParticipant(conv) || {};
              const scrap = conv.scrap || {};

              return (
                <div
                  key={conv._id}
                  className={`conversation-card ${conv.unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => navigate(`/chat/${conv._id}`)}
                >
                  <div className="conv-avatar">
                    {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : '👤'}
                  </div>

                  <div className="conv-details">
                    <div className="conv-top-row">
                      <h4 className="conv-participant-name">
                        {otherUser.name || 'User'}
                        <span className="conv-role-pill">
                          {otherUser.role === 'seller' ? 'Seller' : 'Buyer'}
                        </span>
                      </h4>
                      <span className="conv-time">{formatDate(conv.lastMessageAt)}</span>
                    </div>

                    {scrap.title && (
                      <div className="conv-scrap-tag">
                        📦 <strong>{scrap.title}</strong> ({scrap.category || 'Scrap'})
                      </div>
                    )}

                    <div className="conv-bottom-row">
                      <p className="conv-last-msg">{conv.lastMessage || 'No messages yet'}</p>
                      {conv.unreadCount > 0 && (
                        <span className="unread-dot-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default ConversationsPage;
