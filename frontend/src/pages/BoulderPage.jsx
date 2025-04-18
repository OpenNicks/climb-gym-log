import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ClimbList from '../components/ClimbList';
import { mockBoulders } from '../mockData';
import '../styles/ClimbPages.css';

/**
 * BoulderPage component displays boulders from the selected gym.
 * 
 * @component
 */
const BoulderPage = ({ gymId, token, user }) => {
  const [boulders, setBoulders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoulders = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from API:
        // const response = await fetch(`/api/gyms/${gymId}/boulders`);
        // const data = await response.json();
        
        // For MVP, just show all boulders without filtering
        console.log('Loading boulders for gym ID:', gymId);
        console.log('Available boulders in mock data:', mockBoulders);
        
        // Using all boulders for the MVP
        // Simulate network delay
        setTimeout(() => {
          setBoulders(mockBoulders);
          console.log('Boulders loaded:', mockBoulders.length);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error loading boulders:', err);
        setError(err.message || 'Failed to fetch boulders');
        setLoading(false);
      }
    };

    // Always fetch boulders for the MVP
    fetchBoulders();
  }, [gymId]);

  if (error) {
    return (
      <div className="climb-page-error">
        <h3>Error loading boulders</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="climb-page-container">
      <div className="climb-page-header">
        <h2>Boulders</h2>
        <div className="climb-page-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{boulders.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Newest</span>
            <span className="stat-value">
              {boulders.length > 0 
                ? new Date(Math.max(...boulders.map(b => new Date(b.created_at)))).toLocaleDateString() 
                : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest</span>
            <span className="stat-value">
              {boulders.length > 0 
                ? boulders.sort((a, b) => 
                    b.setter_grade.localeCompare(a.setter_grade, undefined, {numeric: true})
                  )[0].setter_grade
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <ClimbList 
        climbs={boulders} 
        token={token} 
        user={user} 
        loading={loading}
        climbType="boulder"
      />
    </div>
  );
};

BoulderPage.propTypes = {
  gymId: PropTypes.number,
  token: PropTypes.string,
  user: PropTypes.object
};

export default BoulderPage;
