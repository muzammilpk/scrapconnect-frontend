import { useState } from 'react';

function MakeOfferModal({ isOpen, onClose, onSubmit, parentOffer, loading }) {
  const [amount, setAmount] = useState(parentOffer ? parentOffer.amount : '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0');
      return;
    }

    onSubmit(numAmount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card offer-modal-card">
        <div className="modal-header">
          <h3>
            {parentOffer ? '🔄 Submit Counter Offer' : '🏷️ Make a Price Offer'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {parentOffer && (
            <div className="previous-offer-info">
              <span>Previous Offer:</span>{' '}
              <strong>₹{Number(parentOffer.amount).toLocaleString('en-IN')}</strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Proposed Price Amount (₹ INR) <span className="required-star">*</span>
            </label>
            <div className="amount-input-wrapper">
              <span className="currency-input-prefix">₹</span>
              <input
                type="number"
                step="any"
                className="form-input amount-field"
                placeholder="e.g. 2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading || !amount}>
              {loading ? 'Submitting...' : parentOffer ? 'Send Counter Offer' : 'Send Offer'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MakeOfferModal;
