import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/ClimbRating.css';

/**
 * ClimbRating component for displaying and updating climb ratings.
 * 
 * @component
 */
const ClimbRating = ({ initialRating = 0, readonly = false, onRatingChange, size = 'medium' }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const maxStars = 5;
  
  const handleClick = (selectedRating) => {
    if (readonly) return;
    
    setRating(selectedRating);
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  const handleMouseEnter = (starIndex) => {
    if (readonly) return;
    setHoverRating(starIndex);
  };
  
  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'rating-small';
      case 'large': return 'rating-large';
      default: return 'rating-medium';
    }
  };
  
  return (
    <div className={`climb-rating ${getSizeClass()} ${readonly ? 'readonly' : ''}`}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isActive = (hoverRating || rating) >= starValue;
        
        return (
          <span
            key={index}
            className={`star ${isActive ? 'active' : ''}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          >
            ★
          </span>
        );
      })}
      
      {!readonly && (
        <span className="rating-value">
          {hoverRating || rating || '0'}/5
        </span>
      )}
    </div>
  );
};

ClimbRating.propTypes = {
  initialRating: PropTypes.number,
  readonly: PropTypes.bool,
  onRatingChange: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default ClimbRating;
