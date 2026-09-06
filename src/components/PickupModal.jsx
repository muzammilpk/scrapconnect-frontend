import { useState, useEffect } from 'react';

const TIME_SLOTS = [
  { id: 'morning', label: '🌅 Morning', time: '09:00 AM - 12:00 PM' },
  { id: 'afternoon', label: '☀️ Afternoon', time: '12:00 PM - 04:00 PM' },
  { id: 'evening', label: '🌆 Evening', time: '04:00 PM - 08:00 PM' },
];

const QUICK_NOTES = [
  'Call 30 mins before arrival',
  'Bring digital weighing scale',
  'Ground floor pickup',
  'Cash payment on collection',
];

const PickupModal = ({ isOpen, onClose, onSubmit, pickupDetails = {}, defaultAddress = '', submitting = false }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getInTwoDaysString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM - 12:00 PM');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialDate = pickupDetails.date
        ? new Date(pickupDetails.date).toISOString().split('T')[0]
        : getTodayString();
      setDate(initialDate);
      setTime(pickupDetails.time || '09:00 AM - 12:00 PM');
      setAddress(pickupDetails.address || defaultAddress || '');
      setNotes(pickupDetails.notes || '');
    }
  }, [pickupDetails, defaultAddress, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      date: date ? new Date(date) : new Date(),
      time,
      address: address.trim(),
      notes: notes.trim(),
    });
  };

  const handleQuickNoteClick = (noteTag) => {
    if (notes.includes(noteTag)) return;
    setNotes((prev) => (prev ? `${prev}, ${noteTag}` : noteTag));
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Not selected';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-pickup-redesign"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          maxHeight: '90vh',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header - Fixed Top */}
        <div
          className="modal-header"
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🚚</span> Schedule / Edit Pickup Details
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              Set collection date, time slot, and location for smooth scrap pickup
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Scrollable Form Body */}
          <div
            className="modal-body custom-scrollbar"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* 1. DATE SELECTION WITH QUICK PRESETS */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                <span>📅 Pickup Date <span className="required-star">*</span></span>
                <span style={{ fontSize: '0.775rem', color: '#16A34A', fontWeight: 600 }}>{formatDateDisplay(date)}</span>
              </label>

              {/* Quick Date Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn-pill-preset ${date === getTodayString() ? 'active' : ''}`}
                  onClick={() => setDate(getTodayString())}
                >
                  ⚡ Today
                </button>
                <button
                  type="button"
                  className={`btn-pill-preset ${date === getTomorrowString() ? 'active' : ''}`}
                  onClick={() => setDate(getTomorrowString())}
                >
                  📅 Tomorrow
                </button>
                <button
                  type="button"
                  className={`btn-pill-preset ${date === getInTwoDaysString() ? 'active' : ''}`}
                  onClick={() => setDate(getInTwoDaysString())}
                >
                  📆 In 2 Days
                </button>
              </div>

              <input
                type="date"
                className="form-input"
                min={getTodayString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                required
              />
            </div>

            {/* 2. TIME SLOT SELECTION */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                ⏰ Preferred Time Slot <span className="required-star">*</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`time-slot-card ${time === slot.time ? 'selected' : ''}`}
                    onClick={() => setTime(slot.time)}
                    style={{ padding: '0.5rem 0.35rem' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{slot.label}</div>
                    <div style={{ fontSize: '0.725rem', opacity: 0.85, marginTop: '2px' }}>{slot.time}</div>
                  </button>
                ))}
              </div>

              <input
                type="text"
                className="form-input"
                placeholder="Or specify custom time (e.g. 11:30 AM)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                required
              />
            </div>

            {/* 3. PICKUP ADDRESS & QUICK AUTO-FILL */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 600, color: '#1E293B', fontSize: '0.85rem' }}>
                  📍 Collection Address <span className="required-star">*</span>
                </label>
                {defaultAddress && (
                  <button
                    type="button"
                    className="btn-link-sm"
                    onClick={() => setAddress(defaultAddress)}
                    style={{ fontSize: '0.775rem', fontWeight: 600 }}
                  >
                    📍 Use Listing Address
                  </button>
                )}
              </div>

              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter complete pickup address, house/shop number, street, area..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '58px' }}
                required
              />
            </div>

            {/* 4. NOTES & QUICK TAGS */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                📝 Special Instructions (Optional)
              </label>

              {/* Quick Note Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.45rem' }}>
                {QUICK_NOTES.map((tag, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleQuickNoteClick(tag)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.725rem',
                      background: '#F1F5F9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    + {tag}
                  </span>
                ))}
              </div>

              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bring extra rope, call before leaving..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            {/* LIVE SUMMARY PREVIEW BOX */}
            <div style={{ background: '#F8FAFC', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>
                📋 Scheduled Pickup Preview
              </div>
              <div style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>
                📅 {formatDateDisplay(date)} • ⏰ {time}
              </div>
              {address && (
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {address}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - ALWAYS PINNED VISIBLE AT BOTTOM */}
          <div
            className="modal-footer"
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              flexShrink: 0,
              zIndex: 10,
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{
                padding: '0.6rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {submitting ? 'Saving Schedule...' : '💾 Save Pickup Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickupModal;
