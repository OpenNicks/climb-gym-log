import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Navigation.css';

/**
 * Navigation component for the application.
 * 
 * Provides links to different sections of the app and handles user authentication display.
 */
const Navigation = ({ user, onLogout, onProfileClick, onLoginClick, currentPage, onNavigate, gymName }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>{gymName} - Climb Log</h1>
      </div>
      
      <div className="navbar-menu">
        <div className="navbar-links">
          <button 
            className={`nav-link ${currentPage === 'boulders' ? 'active' : ''}`}
            onClick={() => onNavigate('boulders')}>
            Boulders
          </button>
          
          <button 
            className={`nav-link ${currentPage === 'routes' ? 'active' : ''}`}
            onClick={() => onNavigate('routes')}>
            Routes
          </button>
          
          {user && (
            <>
              <button 
                className={`nav-link ${currentPage === 'myascents' ? 'active' : ''}`}
                onClick={() => onNavigate('myascents')}>
                My Ascents
              </button>
              
              <button 
                className={`nav-link ${currentPage === 'stats' ? 'active' : ''}`}
                onClick={() => onNavigate('stats')}>
                Stats
              </button>
            </>
          )}
        </div>
        
        <div className="navbar-auth">
          {user ? (
            <>
              <span className="welcome-text">Welcome, <strong>{user.username}</strong></span>
              <button 
                className="profile-button"
                onClick={onProfileClick}>
                Profile
              </button>
              <button 
                className="logout-button"
                onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button 
              className="login-button"
              onClick={onLoginClick}>
              Login / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
  currentPage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  gymName: PropTypes.string
};

export default Navigation;
