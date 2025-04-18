import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Auth component provides a login/signup UI using AuthContext
 */
const Auth = () => {
  const { user, login, register, logout, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('login'); // or 'signup'
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!username.trim()) {
      setFormError('Username required');
      return;
    }
    if (mode === 'signup' && !email.trim()) {
      setFormError('Email required');
      return;
    }
    
    setFormError('');
    
    // Authentication
    const userData = {
      username: username.trim(),
      email: mode === 'signup' ? email.trim() : ''
    };
    
    const result = mode === 'signup' 
      ? await register(userData)
      : await login(userData);
      
    if (result.success) {
      setUsername('');
      setEmail('');
    }
  };

  if (user) {
    return (
      <div className="auth-bar" style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1rem'}}>
        <span>Logged in as <strong>{user.username}</strong></span>
        <button onClick={logout} className="btn" aria-label="Log out">Log out</button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{display:'flex',gap:'0.7rem',alignItems:'center',marginBottom:'1rem'}}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        aria-label="Username"
        style={{minWidth:100}}
      />
      {mode === 'signup' && (
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-label="Email"
          style={{minWidth:160}}
        />
      )}
      <button type="submit" className="btn btn-primary" aria-label={mode==='signup' ? 'Sign up' : 'Log in'}>{mode==='signup' ? 'Sign up' : 'Log in'}</button>
      <button type="button" className="btn" onClick={()=>setMode(mode==='login'?'signup':'login')} aria-label={mode==='login'?'Switch to sign up':'Switch to log in'}>
        {mode==='login'?'Sign up':'Log in'}
      </button>
      {formError && <span className="form-error" role="alert">{formError}</span>}
      {authError && <span className="form-error" role="alert">{authError}</span>}
    </form>
  );
};

// No props needed since we're using context

export default Auth;
