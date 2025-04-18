import React from 'react';
import ClimbStats from '../components/ClimbStats';
import { useAuth } from '../contexts/AuthContext';
import '../styles/StatsPage.css';

/**
 * StatsPage displays detailed climbing statistics and visualizations
 */
const StatsPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="stats-page">
      <h2>Climbing Analytics</h2>
      
      {isAuthenticated ? (
        <div className="stats-content">
          <p className="stats-intro">
            Analyze your climbing progress, track improvement, and gain insights into your climbing habits.
          </p>
          <ClimbStats />
        </div>
      ) : (
        <div className="login-required">
          <p>Please log in to see your climbing statistics.</p>
          <div className="demo-stats">
            <h3>What you'll see when logged in:</h3>
            <ul>
              <li>Grade distribution charts</li>
              <li>Climbing activity over time</li>
              <li>Send rate analytics</li>
              <li>Personal climbing records</li>
              <li>Progress tracking across sessions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
