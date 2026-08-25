import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socketService';
import OfferCard from '../components/OfferCard';
import MakeOfferModal from '../components/MakeOfferModal';
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

  // Offer Negotiation States
  const [offers, setOffers] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);
  const [acceptedOffer, setAcceptedOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [counterParentOffer, setCounterParentOffer] = useState(null);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [showOfferHistory, setShowOfferHistory] = useState(false);

  // Typing indicator state
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOffers = async () => {
    try {
      const res = await api.getConversationOffers(conversationId);
      if (res.success) {
        setOffers(res.offers || []);
        setActiveOffer(res.pendingOffer || null);
        setAcceptedOffer(res.acceptedOffer || null);
      }
    } catch (err) {
      console.error('Failed to load offer history:', err.message);
    }
  };

  // 1. Initial Load: Fetch Conversation, Messages & Offers
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

        // Fetch offer history
        await fetchOffers();

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

    // Listener: Real-Time Offer Updates
    const handleOfferUpdated = (data) => {
      if (data.conversationId === conversationId) {
        fetchOffers();
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('offer_updated', handleOfferUpdated);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('offer_updated', handleOfferUpdated);
    };
  }, [conversationId, user]);

  // OFFER ACTION HANDLERS
  const handleOfferModalSubmit = async (numAmount) => {
    setSubmittingOffer(true);
    setErrorMsg('');
    const socket = getSocket();

    try {
      let res;
      if (counterParentOffer) {
        res = await api.counterOffer(counterParentOffer._id, numAmount);
      } else {
        res = await api.createOffer(conversationId, numAmount);
      }

      if (res.success && res.offer) {
        setShowOfferModal(false);
        setCounterParentOffer(null);
        await fetchOffers();

        // Emit real-time socket event to other participant
        socket.emit('notify_offer_update', {
          conversationId,
          offer: res.offer,
          eventType: counterParentOffer ? 'countered' : 'created',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    setSubmittingOffer(true);
    setErrorMsg('');
    const socket = getSocket();

    try {
      const res = await api.acceptOffer(offerId);
      if (res.success && res.offer) {
        await fetchOffers();
        if (res.scrap) {
          setConversation((prev) => (prev ? { ...prev, scrap: res.scrap } : prev));
        }

        socket.emit('notify_offer_update', {
          conversationId,
          offer: res.offer,
          eventType: 'accepted',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to accept offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    setSubmittingOffer(true);
    setErrorMsg('');
    const socket = getSocket();

    try {
      const res = await api.rejectOffer(offerId);
      if (res.success && res.offer) {
        await fetchOffers();

        socket.emit('notify_offer_update', {
          conversationId,
          offer: res.offer,
          eventType: 'rejected',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reject offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleCancelOffer = async (offerId) => {
    setSubmittingOffer(true);
    setErrorMsg('');
    const socket = getSocket();

    try {
      const res = await api.cancelOffer(offerId);
      if (res.success && res.offer) {
        await fetchOffers();

        socket.emit('notify_offer_update', {
          conversationId,
          offer: res.offer,
          eventType: 'cancelled',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleOpenCounterModal = (parentOff) => {
    setCounterParentOffer(parentOff);
    setShowOfferModal(true);
  };

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

            {/* Negotiation / Offer Banner & Active Card */}
            <div className="chat-negotiation-section">
              {acceptedOffer || scrap.status === 'reserved' ? (
                <div className="offer-banner offer-banner-accepted">
                  <div className="offer-banner-info">
                    <span className="offer-banner-icon">🎉</span>
                    <div>
                      <h4 className="offer-banner-title">Deal Agreed! (Scrap Reserved)</h4>
                      <p className="offer-banner-sub">
                        Agreed Price: <strong>₹{acceptedOffer?.amount || scrap.finalPrice}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="no-offer-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => navigate('/deals')}
                    >
                      🤝 View Deal Details
                    </button>
                    {offers.length > 0 && (
                      <button
                        className="btn-outline-sm"
                        onClick={() => setShowOfferHistory(!showOfferHistory)}
                      >
                        {showOfferHistory ? 'Hide History' : `History (${offers.length})`}
                      </button>
                    )}
                  </div>
                </div>
              ) : activeOffer ? (
                <div className="active-offer-container">
                  <div className="active-offer-header">
                    <span className="offer-section-label">⚡ Active Negotiation Offer</span>
                    {offers.length > 0 && (
                      <button
                        className="btn-link-sm"
                        onClick={() => setShowOfferHistory(!showOfferHistory)}
                      >
                        {showOfferHistory ? 'Hide History' : `History (${offers.length})`}
                      </button>
                    )}
                  </div>
                  <OfferCard
                    offer={activeOffer}
                    currentUserId={user?._id}
                    onAccept={handleAcceptOffer}
                    onReject={handleRejectOffer}
                    onCounter={handleOpenCounterModal}
                    onCancel={handleCancelOffer}
                    submitting={submittingOffer}
                  />
                </div>
              ) : (
                <div className="no-offer-banner">
                  <div className="no-offer-text">
                    <span>💰</span>
                    <span>Negotiate price with structured offers</span>
                  </div>
                  <div className="no-offer-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => {
                        setCounterParentOffer(null);
                        setShowOfferModal(true);
                      }}
                    >
                      Make an Offer
                    </button>
                    {offers.length > 0 && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => setShowOfferHistory(!showOfferHistory)}
                      >
                        {showOfferHistory ? 'Hide History' : `History (${offers.length})`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* History Drawer / Accordion */}
              {showOfferHistory && (
                <div className="offer-history-drawer">
                  <h4 className="history-drawer-title">📜 Negotiation History</h4>
                  <div className="history-list">
                    {offers.map((off) => (
                      <div key={off._id} className={`history-item history-item-${off.status}`}>
                        <div className="history-item-main">
                          <span className="history-amount">₹{off.amount}</span>
                          <span className={`status-badge status-${off.status}`}>{off.status.toUpperCase()}</span>
                        </div>
                        <div className="history-item-sub">
                          <span>
                            By: {off.offeredBy?._id === user?._id ? 'You' : off.offeredBy?.name || 'Other party'}
                          </span>
                          <span>{formatMsgTime(off.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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

        {/* Offer Creation / Counter Modal */}
        <MakeOfferModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setCounterParentOffer(null);
          }}
          onSubmit={handleOfferModalSubmit}
          counterParentOffer={counterParentOffer}
          scrap={scrap}
          submitting={submittingOffer}
        />
      </main>
    </div>
  );
}

export default ChatPage;
