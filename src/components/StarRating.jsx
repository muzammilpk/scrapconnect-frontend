import { useState } from 'react';

/**
 * Reusable StarRating component for ScrapConnect
 * Supports interactive selection (1-5 stars) or read-only display with numerical rating value.
 */
const StarRating = ({
  rating = 0,
  onChange = null,
  readOnly = false,
  size = 'md', // 'sm', 'md', 'lg'
  showNumber = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleStarClick = (starValue) => {
    if (!readOnly && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (!readOnly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const sizeClass = size === 'sm' ? 'star-sm' : size === 'lg' ? 'star-lg' : 'star-md';

  return (
    <div className={`star-rating-container ${sizeClass} ${readOnly ? 'read-only' : 'interactive'}`}>
      <div className="stars-wrapper">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <span
              key={star}
              className={`star-icon ${isFilled ? 'filled' : 'empty'}`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              role={readOnly ? 'presentation' : 'button'}
              tabIndex={readOnly ? -1 : 0}
            >
              ★
            </span>
          );
        })}
      </div>
      {showNumber && rating > 0 && (
        <span className="star-rating-val">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
