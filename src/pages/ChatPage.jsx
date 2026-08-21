import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socketService';
import api from '../services/api';

function ChatPage() {
  const { id: conversationId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Typing indicator state
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initial Load: Fetch Conversation & Messages
  useEffect(() => {
    const loadChat = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const [convRes, msgRes] = await Promise.all([
          api.getConversationById(conversationId),
          api.getMessages(conversationId),
        ]);

        if (convRes.success && convRes.conversation) {
          setConversation(convRes.conversation);
        }
        if (msgRes.success) {
          setMessages(msgRes.messages || []);
        }

        // Mark unread messages as read
        await api.markConversationRead(conversationId);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load chat history.');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      loadChat();
    }
  }, [conversationId]);

  // 2. Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  // 3. Socket.IO Integration
  useEffect(() => {
    if (!conversationId || !user) return;

    const socket = getSocket();

    // Join room
    socket.emit('join_conversation', { conversationId });

    // Mark read event to socket
    socket.emit('message_read', { conversationId });

    // Listener: Incoming New Message
    const handleNewMessage = (newMsg) => {
      if (newMsg.conversation === conversationId || newMsg.conversation?._id === conversationId) {
        setMessages((prev) => {
          // Avoid duplicate rendering
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // If message is from other user, emit read
        const senderId = typeof newMsg.sender === 'object' ? newMsg.sender._id : newMsg.sender;
        if (senderId !== user._id) {
          socket.emit('message_read', { conversationId });
        }
      }
    };

    // Listener: Typing Events
    const handleUserTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== user._id) {
        setIsOtherTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== user._id) {
        setIsOtherTyping(false);
      }
    };

    // Listener: Messages Read Event
    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            isRead: true,
          }))
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [conversationId, user]);

  // Handle Input Change & Typing Indicator Emission
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    const socket = getSocket();
    socket.emit('typing_start', { conversationId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId });
    }, 1500);
  };

  // Handle Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    const socket = getSocket();
    socket.emit('typing_stop', { conversationId });

    try {
      // Emit via Socket.IO for immediate delivery
      socket.emit('send_message', { conversationId, text: textToSend });
    } catch (err) {
      // Fallback to REST API if socket fails
      try {
        const res = await api.sendMessage(conversationId, textToSend);
        if (res.success && res.message) {
          setMessages((prev) => [...prev, res.message]);
        }
      } catch (restErr) {
        setErrorMsg(restErr.message || 'Failed to send message.');
      }
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!conversation || !user) return { name: 'User', role: '' };
    const isBuyer = conversation.buyer?._id === user._id || conversation.buyer === user._id;
    return isBuyer ? conversation.seller : conversation.buyer;
  };

  const otherUser = getOtherParticipant();
  const scrap = conversation?.scrap || {};

  const formatMsgTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-container chat-layout-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/conversations')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/conversations')}>
            ← Back to Messages
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

      {/* Main Chat Area */}
      <main className="dashboard-content chat-main-content">
        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

        {loading ? (
          <div className="loading-card">Loading conversation...</div>
        ) : (
          <div className="chat-window-card">
            {/* Header: Other Participant & Scrap Info */}
            <div className="chat-window-header">
              <div className="chat-header-user">
                <div className="chat-header-avatar">
                  {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div>
                  <h3 className="chat-header-name">
                    {otherUser?.name || 'User'}{' '}
                    <span className="conv-role-pill">
                      {otherUser?.role === 'seller' ? 'Seller' : 'Buyer'}
                    </span>
                  </h3>
                  {scrap.title && (
                    <p className="chat-header-scrap">
                      📦 Scrap: <strong>{scrap.title}</strong> ({scrap.category || 'Scrap'}) -{' '}
                      {scrap.estimatedWeight} {scrap.weightUnit || 'kg'}
                    </p>
                  )}
                </div>
              </div>

              {scrap._id && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={() =>
                    navigate(user?.role === 'buyer' ? `/buyer/scraps/${scrap._id}` : `/seller/scraps/${scrap._id}`)
                  }
                >
                  View Listing
                </button>
              )}
            </div>

            {/* Messages Body */}
            <div className="chat-messages-body">
              {messages.length === 0 ? (
                <div className="empty-messages-placeholder">
                  <span>💬</span>
                  <p>Start the conversation regarding this scrap listing.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                  const isMe = senderId === user._id;

                  return (
                    <div key={msg._id} className={`message-bubble-wrapper ${isMe ? 'outgoing' : 'incoming'}`}>
                      <div className="message-bubble">
                        <p className="message-text">{msg.text}</p>
                        <div className="message-meta">
                          <span className="message-time">{formatMsgTime(msg.createdAt)}</span>
                          {isMe && (
                            <span className="message-status-ticks">
                              {msg.isRead ? ' ✓✓' : ' ✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isOtherTyping && (
                <div className="message-bubble-wrapper incoming">
                  <div className="message-bubble typing-bubble">
                    <span className="typing-dots">
                      {otherUser?.name || 'User'} is typing<span>.</span><span>.</span><span>.</span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form className="chat-input-footer" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-text-input"
                placeholder="Type a message..."
                value={inputText}
                onChange={handleInputChange}
              />
              <button type="submit" className="btn-primary chat-send-btn" disabled={!inputText.trim() || sending}>
                Send ✈️
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default ChatPage;
