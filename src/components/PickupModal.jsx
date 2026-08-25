import { useState, useEffect } from 'react';

const PickupModal = ({ isOpen, onClose, onSubmit, pickupDetails = {}, submitting = false }) => {
  const [date, setDate] = useState(pickupDetails.date ? new Date(pickupDetails.date).toISOString().split('T')[0] : '');
  const [time, setTime] = useState(pickupDetails.time || '10:00 AM');
  const [address, setAddress] = useState(pickupDetails.address || '');
  const [notes, setNotes] = useState(pickupDetails.notes || '');

  useEffect(() => {
    if (pickupDetails) {
      setDate(pickupDetails.date ? new Date(pickupDetails.date).toISOString().split('T')[0] : '');
      setTime(pickupDetails.time || '10:00 AM');
      setAddress(pickupDetails.address || '');
      setNotes(pickupDetails.notes || '');
    }
  }, [pickupDetails, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      date: date ? new Date(date) : null,
      time,
      address,
      notes,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🚚 Schedule / Edit Pickup Details</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Pickup Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Time Slot</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 10:00 AM - 12:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Address / Location</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Full pickup location or landmarks..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Call before arriving, bring weighing scale..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Pickup Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickupModal;
