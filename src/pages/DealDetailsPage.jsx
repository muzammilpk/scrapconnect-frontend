import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socketService';
import PickupModal from '../components/PickupModal';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import api from '../services/api';

function DealDetailsPage() {
  const { id: dealId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pickup Modal state
  const [showPickupModal, setShowPickupModal] = useState(false);

  // Review states
  const [userReview, setUserReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDealDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getDealById(dealId);
      if (res.success && res.deal) {
        setDeal(res.deal);
        if (res.conversationId) {
          setConversationId(res.conversationId);
        }

        // If deal is completed, fetch user reviews to check if already reviewed
        if (res.deal.status === 'completed') {
          const counterpartId = (res.deal.buyer?._id || res.deal.buyer) === user._id ? (res.deal.seller?._id || res.deal.seller) : (res.deal.buyer?._id || res.deal.buyer);
          const reviewsRes = await api.getUserReviews(counterpartId);
          if (reviewsRes.success && reviewsRes.reviews) {
            const foundMyReview = reviewsRes.reviews.find(
              (r) => (r.deal?._id || r.deal) === res.deal._id && (r.reviewer?._id || r.reviewer) === user._id
            );
            if (foundMyReview) {
              setUserReview(foundMyReview);
            }
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load deal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dealId && user) {
      fetchDealDetails();
    }
  }, [dealId, user]);

  // Real-Time Socket Listener for Deal Updates
  useEffect(() => {
    const socket = getSocket();

    const handleDealUpdated = (data) => {
      if (data.deal && (data.deal._id === dealId || data.deal === dealId)) {
        fetchDealDetails();
      }
    };

    socket.on('deal_updated', handleDealUpdated);

    return () => {
      socket.off('deal_updated', handleDealUpdated);
    };
  }, [dealId]);

  // Action Handlers
  const handleConfirmDeal = async () => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.updateDealStatus(dealId, 'confirmed');
      if (res.success) {
        setDeal(res.deal);
        setSuccessMsg('Deal confirmed successfully!');
        const socket = getSocket();
        socket.emit('notify_deal_update', { conversationId, deal: res.deal, eventType: 'confirmed' });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to confirm deal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteDeal = async () => {
    if (!window.confirm('Are you sure the scrap has been physically collected? This will mark the scrap as SOLD and complete the deal.')) {
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.updateDealStatus(dealId, 'completed');
      if (res.success) {
        setDeal(res.deal);
        setSuccessMsg('🎉 Deal completed successfully! Scrap is marked as SOLD.');
        const socket = getSocket();
        socket.emit('notify_deal_update', { conversationId, deal: res.deal, eventType: 'completed' });
        await fetchDealDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete deal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDeal = async () => {
    const reason = window.prompt('Please provide a reason for cancelling this deal:');
    if (reason === null) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.updateDealStatus(dealId, 'cancelled', reason);
      if (res.success) {
        setDeal(res.deal);
        setSuccessMsg('Deal cancelled. Scrap listing has been returned to Available status.');
        const socket = getSocket();
        socket.emit('notify_deal_update', { conversationId, deal: res.deal, eventType: 'cancelled' });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel deal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePickupDetails = async (pickupData) => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.updateDealPickup(dealId, pickupData);
      if (res.success) {
        setDeal(res.deal);
        setShowPickupModal(false);
        setSuccessMsg('Pickup details updated successfully!');
        const socket = getSocket();
        socket.emit('notify_deal_update', { conversationId, deal: res.deal, eventType: 'pickup_scheduled' });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update pickup details');
    } finally {
      setSubmitting(false);
    }
  };

  // Review Handlers
  const handleReviewSubmit = async ({ rating, comment }) => {
    setSubmittingReview(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (userReview) {
        // Edit existing review
        const res = await api.updateReview(userReview._id, rating, comment);
        if (res.success) {
          setUserReview(res.review);
          setIsEditingReview(false);
          setSuccessMsg('✓ Review updated successfully!');
        }
      } else {
        // Create new review
        const res = await api.createReview(dealId, rating, comment);
        if (res.success) {
          setUserReview(res.review);
          setSuccessMsg('✓ Review submitted successfully! Thank you for rating.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !window.confirm('Are you sure you want to delete your review?')) return;

    setSubmittingReview(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.deleteReview(userReview._id);
      if (res.success) {
        setUserReview(null);
        setIsEditingReview(false);
        setSuccessMsg('Review deleted.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getCounterpart = () => {
    if (!deal || !user) return { name: 'User', role: '' };
    const isBuyer = (deal.buyer?._id || deal.buyer) === user._id;
    return isBuyer ? deal.seller : deal.buyer;
  };

  const counterpart = getCounterpart();
  const scrap = deal?.scrap || {};
  const pickup = deal?.pickupDetails || {};

  // Timeline Step Computations
  const isCancelled = deal?.status === 'cancelled';
  const isCompleted = deal?.status === 'completed';
  const isPickupScheduled = deal?.status === 'pickup_scheduled' || isCompleted;
  const isConfirmed = deal?.status === 'confirmed' || isPickupScheduled;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/deals')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/deals')}>
            ← Back to My Deals
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
        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
        {successMsg && <div className="alert-success">✅ {successMsg}</div>}

        {loading ? (
          <div className="loading-card">Loading deal details...</div>
        ) : !deal ? (
          <div className="empty-regions-card">
            <h3>Deal Not Found</h3>
            <button className="btn-primary" onClick={() => navigate('/deals')}>
              Return to My Deals
            </button>
          </div>
        ) : (
          <div className="deal-details-layout">
            {/* Visual Timeline Section */}
            <div className="deal-card timeline-card">
              <h3 className="section-title">📍 Transaction Progress Timeline</h3>

              {isCancelled ? (
                <div className="cancelled-banner">
                  <span className="cancelled-icon">❌</span>
                  <div>
                    <h4 className="cancelled-title">Deal Cancelled</h4>
                    <p className="cancelled-sub">
                      Cancelled on: {new Date(deal.cancelledAt).toLocaleString()}
                      {deal.cancellationReason && ` • Reason: "${deal.cancellationReason}"`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="timeline-stepper">
                  {/* Step 1 */}
                  <div className="timeline-step step-completed">
                    <div className="step-circle">✓</div>
                    <div className="step-label">Offer Accepted</div>
                    <div className="step-date">{new Date(deal.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className={`timeline-line ${isConfirmed ? 'line-completed' : ''}`} />

                  {/* Step 2 */}
                  <div className={`timeline-step ${isConfirmed ? 'step-completed' : 'step-pending'}`}>
                    <div className="step-circle">{isConfirmed ? '✓' : '2'}</div>
                    <div className="step-label">Deal Confirmed</div>
                    <div className="step-date">
                      {deal.confirmedAt ? new Date(deal.confirmedAt).toLocaleDateString() : 'Pending'}
                    </div>
                  </div>

                  <div className={`timeline-line ${isPickupScheduled ? 'line-completed' : ''}`} />

                  {/* Step 3 */}
                  <div className={`timeline-step ${isPickupScheduled ? 'step-completed' : 'step-pending'}`}>
                    <div className="step-circle">{isPickupScheduled ? '✓' : '3'}</div>
                    <div className="step-label">Pickup Scheduled</div>
                    <div className="step-date">
                      {pickup.date ? new Date(pickup.date).toLocaleDateString() : 'Pending'}
                    </div>
                  </div>

                  <div className={`timeline-line ${isCompleted ? 'line-completed' : ''}`} />

                  {/* Step 4 */}
                  <div className={`timeline-step ${isCompleted ? 'step-completed' : 'step-pending'}`}>
                    <div className="step-circle">{isCompleted ? '🎉' : '4'}</div>
                    <div className="step-label">Scrap Sold & Collected</div>
                    <div className="step-date">
                      {deal.completedAt ? new Date(deal.completedAt).toLocaleDateString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rating and Review Section (Only on Completed Deals) */}
            {isCompleted && (
              <div className="deal-card review-section-card">
                <h3 className="section-title">⭐ Deal Experience & Review</h3>

                {userReview && !isEditingReview ? (
                  <div className="user-submitted-review-box">
                    <div className="submitted-review-header">
                      <div>
                        <span className="submitted-tag">✓ You reviewed {counterpart.name}</span>
                        <div className="submitted-stars-row">
                          <StarRating rating={userReview.rating} readOnly size="md" showNumber />
                        </div>
                      </div>
                      <div className="review-action-btns">
                        <button className="btn-link-sm" onClick={() => setIsEditingReview(true)}>
                          ✏️ Edit Review
                        </button>
                        <button className="btn-danger-link" onClick={handleDeleteReview} disabled={submittingReview}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    {userReview.comment && (
                      <p className="submitted-comment-text">"{userReview.comment}"</p>
                    )}
                  </div>
                ) : (
                  <ReviewForm
                    initialRating={userReview?.rating || 5}
                    initialComment={userReview?.comment || ''}
                    onSubmit={handleReviewSubmit}
                    onCancel={userReview ? () => setIsEditingReview(false) : null}
                    submitting={submittingReview}
                    submitLabel={userReview ? 'Update Review' : 'Submit Review'}
                    targetUserName={counterpart.name || 'User'}
                  />
                )}
              </div>
            )}

            {/* Deal Main Info Grid */}
            <div className="deal-info-grid">
              {/* Left Column: Scrap & Pricing */}
              <div className="deal-card">
                <h3 className="section-title">📦 Scrap Information</h3>
                <div className="deal-scrap-header-box">
                  <div>
                    <h2 className="deal-scrap-main-title">{scrap.title || 'Scrap Material'}</h2>
                    <p className="deal-scrap-sub">
                      Category: <strong>{scrap.category}</strong> • Weight: <strong>{scrap.estimatedWeight} {scrap.weightUnit || 'kg'}</strong>
                    </p>
                    {scrap.description && <p className="deal-scrap-desc">"{scrap.description}"</p>}
                  </div>
                  <div className="deal-agreed-price-tag">
                    <span className="price-tag-label">Agreed Deal Price</span>
                    <span className="price-tag-value">₹{deal.agreedPrice?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {scrap.location && (
                  <div className="deal-location-box">
                    <strong>📍 Collection Location:</strong> {scrap.location.city}, {scrap.location.district}, {scrap.location.state} {scrap.location.pincode ? `(${scrap.location.pincode})` : ''}
                  </div>
                )}
              </div>

              {/* Right Column: Counterpart & Actions */}
              <div className="deal-card">
                <h3 className="section-title">👤 {user?.role === 'buyer' ? 'Seller Details' : 'Buyer Details'}</h3>
                <div className="party-details-box">
                  <div className="party-avatar">
                    {counterpart.name ? counterpart.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div>
                    <h4 className="party-name-title">{counterpart.name || 'User'}</h4>
                    <p className="party-role-text">{user?.role === 'buyer' ? 'Scrap Seller ♻️' : 'Scrap Buyer 🛒'}</p>
                    {counterpart.phone && <p className="party-phone-text">📞 Phone: {counterpart.phone}</p>}
                    {counterpart.email && <p className="party-email-text">✉️ Email: {counterpart.email}</p>}
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="deal-actions-group">
                  {conversationId && (
                    <button className="btn-secondary" onClick={() => navigate(`/chat/${conversationId}`)}>
                      💬 Open Chat Conversation
                    </button>
                  )}

                  {!isCancelled && !isCompleted && (
                    <>
                      {deal.status === 'pending_confirmation' && (
                        <button className="btn-primary" onClick={handleConfirmDeal} disabled={submitting}>
                          ✅ Confirm Deal
                        </button>
                      )}

                      <button className="btn-outline-sm" onClick={() => setShowPickupModal(true)}>
                        🚚 {pickup.date ? 'Edit Pickup Details' : 'Schedule Pickup'}
                      </button>

                      <button className="btn-success-sm" onClick={handleCompleteDeal} disabled={submitting}>
                        🎉 Mark as Collected (Complete Deal)
                      </button>

                      <button className="btn-danger-link" onClick={handleCancelDeal} disabled={submitting}>
                        Cancel Deal
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Pickup Information Card */}
            <div className="deal-card">
              <div className="section-header-flex">
                <h3 className="section-title">🚚 Pickup & Collection Details</h3>
                {!isCancelled && !isCompleted && (
                  <button className="btn-link-sm" onClick={() => setShowPickupModal(true)}>
                    ✏️ Edit Pickup Details
                  </button>
                )}
              </div>

              {pickup.date ? (
                <div className="pickup-details-grid">
                  <div className="pickup-info-item">
                    <span className="pickup-info-label">Pickup Date:</span>
                    <span className="pickup-info-val">📅 {new Date(pickup.date).toLocaleDateString()}</span>
                  </div>
                  <div className="pickup-info-item">
                    <span className="pickup-info-label">Time Slot:</span>
                    <span className="pickup-info-val">⏰ {pickup.time || 'Not specified'}</span>
                  </div>
                  <div className="pickup-info-item">
                    <span className="pickup-info-label">Pickup Location:</span>
                    <span className="pickup-info-val">📍 {pickup.address || `${scrap.location?.city}, ${scrap.location?.state}`}</span>
                  </div>
                  {pickup.notes && (
                    <div className="pickup-info-item full-width">
                      <span className="pickup-info-label">Special Notes:</span>
                      <span className="pickup-info-val">📝 {pickup.notes}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-pickup-box">
                  <p>No pickup details scheduled yet.</p>
                  {!isCancelled && !isCompleted && (
                    <button className="btn-primary btn-sm" onClick={() => setShowPickupModal(true)}>
                      Schedule Pickup Date & Time
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pickup Details Modal */}
        <PickupModal
          isOpen={showPickupModal}
          onClose={() => setShowPickupModal(false)}
          onSubmit={handleSavePickupDetails}
          pickupDetails={pickup}
          submitting={submitting}
        />
      </main>
    </div>
  );
}

export default DealDetailsPage;
