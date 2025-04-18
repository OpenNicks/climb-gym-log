import React, { useState } from 'react';

import { addClimb } from './api/climbs';
import { useNotification } from './components/NotificationProvider';

export default function AddClimbForm({ onAdd }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Use centralized API
      await addClimb({ name, grade });
      setName('');
      setGrade('');
      setSuccess('Climb added!');
      showNotification('Climb added!', 'success');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Error adding climb');
      showNotification(err.message || 'Error adding climb', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Climb name" required disabled={loading} />
      <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="Grade (e.g. V4, 5.11b)" disabled={loading} />
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Climb'}</button>
      {loading && <span style={{ color: '#888', marginLeft: 8 }}>⏳</span>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {/* NotificationProvider handles global notifications */}
    </form>
  );
}
