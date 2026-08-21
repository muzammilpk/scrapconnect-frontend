import React from 'react';
import { useNavigate } from 'react-router-dom';

function ScrapCard({ scrap, detailPath }) {
  const navigate = useNavigate();

  if (!scrap) return null;

  const coverImg = scrap.images && scrap.images.length > 0 ? scrap.images[0].url : null;
  const locationStr = [scrap.location?.area, scrap.location?.city, scrap.location?.district]
    .filter(Boolean)
    .join(', ');

  const handleCardClick = () => {
    if (detailPath) {
      navigate(detailPath);
    } else {
      navigate(`/buyer/scraps/${scrap._id}`);
    }
  };

  return (
    <div className="scrap-card marketplace-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="scrap-card-image-wrapper">
        {coverImg ? (
          <img src={coverImg} alt={scrap.title} className="scrap-card-img" />
        ) : (
          <div className="scrap-card-img-placeholder">
            <span>📦</span>
          </div>
        )}
        <span className={`status-badge ${scrap.status}`}>
          {scrap.status?.toUpperCase()}
        </span>
      </div>

      <div className="scrap-card-body">
        <div className="scrap-category-tag">{scrap.category}</div>
        <h3 className="scrap-card-title">{scrap.title}</h3>

        <div className="scrap-meta-row">
          <div className="meta-item">
            <span className="meta-icon">⚖️</span>
            <strong>{scrap.estimatedWeight} {scrap.weightUnit || 'kg'}</strong>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{locationStr || 'Location specified'}</span>
          </div>
        </div>

        <div className="scrap-card-footer-action">
          <button
            className="btn-primary btn-sm btn-full"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            👁️ View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScrapCard;
