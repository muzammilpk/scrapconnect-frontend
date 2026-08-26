import { useState, useEffect } from 'react';
import StarRating from './StarRating';

const ReviewForm = ({
  initialRating = 5,
  initialComment = '',
  onSubmit,
  onCancel = null,
  submitting = false,
  submitLabel = 'Submit Review',
  targetUserName = 'User',
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setRating(initialRating || 5);
    setComment(initialComment || '');
  }, [initialRating, initialComment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating (1 to 5 stars)');
      return;
    }
    setErrorMsg('');
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form className="review-form-card" onSubmit={handleSubmit}>
      <h4 className="review-form-title">Rate experience with {targetUserName}</h4>

      {errorMsg && <div className="alert-error-sm">⚠️ {errorMsg}</div>}

      <div className="form-group center-content">
        <label className="form-label">Tap stars to select rating:</label>
        <StarRating rating={rating} onChange={setRating} size="lg" />
        <span className="rating-label-text">
          {rating === 5 && '⭐⭐⭐⭐⭐ Excellent (5 Stars)'}
          {rating === 4 && '⭐⭐⭐⭐ Very Good (4 Stars)'}
          {rating === 3 && '⭐⭐⭐ Average (3 Stars)'}
          {rating === 2 && '⭐⭐ Poor (2 Stars)'}
          {rating === 1 && '⭐ Terrible (1 Star)'}
        </span>
      </div>

      <div className="form-group">
        <label className="form-label">Write a review (optional):</label>
        <textarea
          className="form-textarea"
          rows="3"
          maxLength="500"
          placeholder="Share details of your experience (e.g. prompt pickup, friendly communication)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="char-counter">{comment.length} / 500 characters</div>
      </div>

      <div className="review-form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary btn-sm" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary btn-sm" disabled={submitting}>
          {submitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
