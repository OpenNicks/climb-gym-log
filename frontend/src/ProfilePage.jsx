import React, { useEffect, useState } from 'react';

export default function ProfilePage({ username, token, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/users/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Could not load profile');
        setProfile(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username, token]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <button onClick={onBack}>&larr; Back</button>
      <h2>Profile: {profile.username}</h2>
      <div>Email: {profile.email}</div>
      <div>Climbs Set: {profile.climbs_set.length}</div>
      <ul>
        {profile.climbs_set.map(id => (
          <li key={id}>Climb ID: {id}</li>
        ))}
      </ul>
      <div>Ratings Given: {profile.ratings.length}</div>
      <ul>
        {profile.ratings.map(r => (
          <li key={r.climb_id}>Climb ID: {r.climb_id}, Rating: {r.rating}</li>
        ))}
      </ul>
    </div>
  );
}
