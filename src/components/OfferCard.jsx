import React from 'react';

function OfferCard({ offer, currentUserId, onAccept, onReject, onCounter, onCancel, loadingAction }) {
  if (!offer) return null;

  const isCreator = typeof offer.offeredBy === 'object'
    ? offer.offeredBy?._id === currentUserId
    : offer.offeredBy === currentUserId;

  const creatorName = typeof offer.offeredBy === 'object' ? offer.offeredBy?.name : 'User';
  const creatorRole = typeof offer.offeredBy === 'object' ? offer.offeredBy?.role : '';

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'status-badge available';
      case 'rejected':
      case 'cancelled':
        return 'status-badge sold';
      case 'countered':
        return 'status-badge reserved';
      case 'pending':
      default:
        return 'status-badge pending-offer';
    }
  };

  return (
    <div className={`offer-card-component status-${offer.status}`}>
      <div className="offer-card-header">
        <div className="offer-card-title-group">
          <span className="offer-icon">🏷️</span>
          <div>
            <h4 className="offer-heading">
              {offer.status === 'accepted'
                ? 'Agreed Price Offer'
                : offer.parentOffer
                ? 'Counter Offer'
                : 'Price Offer'}
            </h4>
            <span className="offer-creator-label">
              Offered by <strong>{isCreator ? 'You' : creatorName}</strong> ({creatorRole || 'Participant'})
            </span>
          </div>
        </div>

        <span className={getStatusBadgeClass(offer.status)}>
          {offer.status.toUpperCase()}
        </span>
      </div>

      <div className="offer-card-amount-body">
        <span className="currency-symbol">₹</span>
        <span className="amount-number">{Number(offer.amount).toLocaleString('en-IN')}</span>
        <span className="currency-code">{offer.currency || 'INR'}</span>
      </div>

      {/* Action Buttons for Pending Offer */}
      {offer.status === 'pending' && (
        <div className="offer-card-actions">
          {!isCreator ? (
            <>
              <button
                className="btn-primary btn-sm"
                onClick={() => onAccept(offer._id)}
                disabled={loadingAction}
              >
                ✓ Accept ₹{Number(offer.amount).toLocaleString('en-IN')}
              </button>

              <button
                className="btn-secondary btn-sm"
                onClick={() => onCounter(offer)}
                disabled={loadingAction}
              >
                🔄 Counter Offer
              </button>

              <button
                className="btn-secondary btn-danger-text btn-sm"
                onClick={() => onReject(offer._id)}
                disabled={loadingAction}
              >
                ✕ Reject
              </button>
            </>
          ) : (
            <button
              className="btn-secondary btn-danger-text btn-sm"
              onClick={() => onCancel(offer._id)}
              disabled={loadingAction}
            >
              🚫 Cancel Offer
            </button>
          )}
        </div>
      )}

      {/* Accepted Status Details */}
      {offer.status === 'accepted' && (
        <div className="accepted-banner-notice">
          <span>🎉 Offer accepted! Scrap is now <strong>RESERVED</strong> for this buyer.</span>
        </div>
      )}
    </div>
  );
}

export default OfferCard;
