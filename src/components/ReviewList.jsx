import StarRating from './StarRating';

const ReviewList = ({ reviews = [], currentUserId = null, onEdit = null, onDelete = null }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="empty-reviews-box">
        <span className="empty-star-icon">⭐</span>
        <p className="empty-reviews-text">No reviews received yet.</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review) => {
        const reviewer = review.reviewer || {};
        const isMyReview = currentUserId && (reviewer._id === currentUserId || reviewer === currentUserId);

        return (
          <div key={review._id} className="review-card-item">
            <div className="review-card-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {reviewer.name ? reviewer.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div>
                  <h4 className="reviewer-name">
                    {reviewer.name || 'Anonymous'}{' '}
                    <span className="reviewer-role-badge">
                      {reviewer.role === 'buyer' ? 'Buyer 🛒' : 'Seller ♻️'}
                    </span>
                  </h4>
                  <div className="review-meta-row">
                    <StarRating rating={review.rating} readOnly size="sm" />
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {isMyReview && (
                <div className="review-item-actions">
                  {onEdit && (
                    <button className="btn-link-sm" onClick={() => onEdit(review)}>
                      ✏️ Edit
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn-danger-link" onClick={() => onDelete(review._id)}>
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}
            </div>

            {review.comment && <p className="review-comment-text">"{review.comment}"</p>}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
