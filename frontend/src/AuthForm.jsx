import React, { useState } from 'react';

export default function AuthForm({ onAuth, mode = 'login' }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || 'Registration failed');
        }
        setSuccess('Registration successful! Logging you in...');
      }
      res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Login failed');
      }
      const { access_token } = await res.json();
      setSuccess('Login successful!');
      onAuth(access_token);
    } catch (e) {
      setError(typeof e === 'string' ? e : e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      {isRegister && (
        <div>
          <input
            placeholder="Email"
            value={email}
            type="email"
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
      )}
      <div>
        <input
          placeholder="Password"
          value={password}
          type="password"
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : (isRegister ? 'Register & Login' : 'Login')}
      </button>
      {loading && <div style={{ color: '#888' }}>⏳ Authenticating...</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
