import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/LoginModal.css';

/**
 * LoginModal component for user authentication
 */
const LoginModal = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.username) {
      setError('Username is required');
      return;
    }

    if (mode === 'register') {
      if (!formData.email) {
        setError('Email is required');
        return;
      }
      
      if (!formData.password) {
        setError('Password is required');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    // In a real application, we would make an API call here
    // For now, just pass the user data back
    onLogin({
      username: formData.username,
      email: formData.email || 'demo@example.com'
    });
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="login-modal">
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>
          
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </div>
          
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
              />
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="modal-footer">
          <p>
            {mode === 'login' 
              ? "Don't have an account?" 
              : "Already have an account?"}
            <button 
              className="toggle-button"
              type="button" 
              onClick={toggleMode}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
          
          {mode === 'login' && (
            <button className="forgot-password">
              Forgot Password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

LoginModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired
};

export default LoginModal;
