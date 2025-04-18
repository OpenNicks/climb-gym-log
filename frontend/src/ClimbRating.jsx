import React from 'react';

export default function ClimbRating({ rating = 0, onRate }) {
  // Reason: Default rating to 0 for null/undefined/bad values
  const safeRating = typeof rating === 'number' && rating >= 0 && rating <= 5 ? rating : 0;
  const handleRate = typeof onRate === 'function' ? onRate : () => {};
  // Show 5 stars, highlight as many as the current rating
  return (
    <span>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          role="button"
          aria-label={`star ${star}`}
          style={{ cursor: 'pointer', color: star <= safeRating ? '#FFD700' : '#CCC', fontSize: 20 }}
          onClick={() => handleRate(star)}
          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
          data-testid={`star-${star}`}
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleRate(star); }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
