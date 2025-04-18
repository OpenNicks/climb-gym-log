import React, { useState } from 'react';
import ClimbRating from './ClimbRating';
import ClimbComments from './ClimbComments';
import AscentLog from './AscentLog';
import { updateClimbRating } from './api/climbs';
import { useNotification } from './components/NotificationProvider';

export default function ClimbList({ climbs, onDelete, onRatingChange, token, user }) {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { showNotification } = useNotification();

  const handleRate = async (climb, newRating) => {
    setLoadingId(climb.id);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateClimbRating(climb.id, newRating, token);
      if (onRatingChange) onRatingChange(updated);
      setSuccess('Rating updated!');
      showNotification('Rating updated!', 'success');
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError(e.message || 'Error updating rating');
      showNotification(e.message || 'Error updating rating', 'error');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingId(null);
    }
  };



  return (
    <ul style={{ padding: 0, listStyle: 'none' }}>
      {climbs.map(climb => (
        <li key={climb.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ flex: 1 }}>
            {climb.name} ({climb.grade || climb.setter_grade || 'N/A'})
          </span>
          {user && token ? (
            <>
              <ClimbRating
                rating={climb.rating || 0}
                onRate={r => handleRate(climb, r)}
                disabled={loadingId === climb.id}
              />
              {loadingId === climb.id && <span style={{ marginLeft: 8 }}>⏳</span>}
            </>
          ) : (
            <span style={{ color: '#888', marginLeft: 8 }}>Login to rate</span>
          )}
          <button style={{ marginLeft: 8, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onDelete(climb.id)} title="Delete">✕</button>
          <ClimbComments climbId={climb.id} token={token} user={user} />
          {user && token && (
            <div style={{ marginTop: 8 }}>
              <AscentLog climbId={climb.id} token={token} />
            </div>
          )}
        </li>
      ))}
      {error && <li style={{ color: 'red' }}>{error}</li>}
      {success && <li style={{ color: 'green' }}>{success}</li>}
    </ul>
  );
}
