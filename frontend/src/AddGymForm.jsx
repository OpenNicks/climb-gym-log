import React, { useState } from 'react';

export default function AddGymForm({ onAdd }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await onAdd(name);
      setName('');
      setSuccess('Gym added!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Error adding gym');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="New gym name" required disabled={loading} />
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Gym'}</button>
      {loading && <span style={{ color: '#888', marginLeft: 8 }}>⏳</span>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
