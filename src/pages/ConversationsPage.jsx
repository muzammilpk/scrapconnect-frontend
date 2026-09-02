import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';
import { getSocket } from '../services/socketService';

function ConversationsPage() {
  usePageTitle('Messages');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsersMap, setOnlineUsersMap] = useState({});
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

    const socket = getSocket();
    if (socket) {
      const handleUserOnline = ({ userId }) => {
        if (userId) setOnlineUsersMap((prev) => ({ ...prev, [userId]: true }));
      };

      const handleUserOffline = ({ userId }) => {
        if (userId) setOnlineUsersMap((prev) => ({ ...prev, [userId]: false }));
      };

      const handleMessageNew = (newMsg) => {
        setConversations((prevConvs) => {
          const convId = typeof newMsg.conversation === 'object' ? newMsg.conversation._id : newMsg.conversation;
          return prevConvs.map((conv) => {
            if (conv._id === convId) {
              const isOtherSender = typeof newMsg.sender === 'object' ? newMsg.sender._id !== user?._id : newMsg.sender !== user?._id;
              return {
                ...conv,
                lastMessage: newMsg.text,
                lastMessageAt: newMsg.createdAt,
                unreadCount: isOtherSender ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        });
      };

      socket.on('user:online', handleUserOnline);
      socket.on('user:offline', handleUserOffline);
      socket.on('message:new', handleMessageNew);

      return () => {
        socket.off('user:online', handleUserOnline);
        socket.off('user:offline', handleUserOffline);
        socket.off('message:new', handleMessageNew);
      };
    }
  }, [user?._id]);

  const getOtherParticipant = (conv) => {
    if (!conv || !user) return {};
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

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const otherUser = getOtherParticipant(conv);
    const scrap = conv.scrap || {};

    return (
      otherUser.name?.toLowerCase().includes(q) ||
      scrap.title?.toLowerCase().includes(q) ||
      scrap.category?.toLowerCase().includes(q) ||
      conv.lastMessage?.toLowerCase().includes(q)
    );
  });

  const totalUnreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="conversations-header">
          <div>
            <h1>
              Messages 💬{' '}
              {totalUnreadChatCount > 0 && (
                <span className="unread-dot-badge" style={{ verticalAlign: 'middle', fontSize: '0.85rem' }}>
                  {totalUnreadChatCount}
                </span>
              )}
            </h1>
            <p className="welcome-sub">Direct real-time communication with buyers and sellers</p>
          </div>
        </div>

        {/* Search Bar */}
        {conversations.length > 0 && (
          <div className="search-bar-wrapper" style={{ marginBottom: '1.25rem' }}>
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search messages by user name, scrap item, or message content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
        )}

        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

        {loading ? (
          <div className="loading-card">Loading messages...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty-regions-card">
            <div className="empty-icon">💬</div>
            <h3>{searchQuery ? 'No Matching Conversations' : 'No Conversations Yet'}</h3>
            <p>
              {searchQuery
                ? 'Try searching with a different keyword or name.'
                : user?.role === 'buyer'
                ? 'Browse scrap listings and click "Contact Seller" to start chatting.'
                : 'When buyers contact you regarding your scrap listings, messages will appear here.'}
            </p>
            {user?.role === 'buyer' && !searchQuery && (
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
            {filteredConversations.map((conv) => {
              const otherUser = getOtherParticipant(conv) || {};
              const scrap = conv.scrap || {};
              const otherUserIdStr = otherUser._id ? otherUser._id.toString() : '';
              const isOnline = onlineUsersMap[otherUserIdStr] || false;

              return (
                <div
                  key={conv._id}
                  className={`conversation-card ${conv.unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => navigate(`/chat/${conv._id}`)}
                >
                  <div className="conv-avatar" style={{ position: 'relative' }}>
                    {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : '👤'}
                    {isOnline && <span className="online-status-dot" title="Online" />}
                  </div>

                  <div className="conv-details">
                    <div className="conv-top-row">
                      <h4 className="conv-participant-name">
                        {otherUser.name || 'User'}
                        <span className="conv-role-pill">
                          {otherUser.role === 'seller' ? 'Seller' : 'Buyer'}
                        </span>
                        {isOnline && <span className="online-badge-text">● Online</span>}
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
