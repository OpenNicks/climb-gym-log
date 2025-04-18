import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ClimbList from '../components/ClimbList';
import { mockRoutes } from '../mockData';
import '../styles/ClimbPages.css';

/**
 * RoutePage component displays routes from the selected gym.
 * 
 * @component
 */
const RoutePage = ({ gymId, token, user }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from API:
        // const response = await fetch(`/api/gyms/${gymId}/routes`);
        // const data = await response.json();
        
        // For MVP, just show all routes without filtering
        console.log('Loading routes for gym ID:', gymId);
        console.log('Available routes in mock data:', mockRoutes);
        
        // Using all routes for the MVP
        // Simulate network delay
        setTimeout(() => {
          setRoutes(mockRoutes);
          console.log('Routes loaded:', mockRoutes.length);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error loading routes:', err);
        setError(err.message || 'Failed to fetch routes');
        setLoading(false);
      }
    };

    // Always fetch routes for the MVP
    fetchRoutes();
  }, [gymId]);

  if (error) {
    return (
      <div className="climb-page-error">
        <h3>Error loading routes</h3>
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
        <h2>Routes</h2>
        <div className="climb-page-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{routes.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Newest</span>
            <span className="stat-value">
              {routes.length > 0 
                ? new Date(Math.max(...routes.map(r => new Date(r.created_at)))).toLocaleDateString() 
                : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest</span>
            <span className="stat-value">
              {routes.length > 0 
                ? routes.sort((a, b) => 
                    b.setter_grade.localeCompare(a.setter_grade, undefined, {numeric: true})
                  )[0].setter_grade
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <ClimbList 
        climbs={routes} 
        token={token} 
        user={user} 
        loading={loading}
        climbType="route"
      />
    </div>
  );
};

RoutePage.propTypes = {
  gymId: PropTypes.number,
  token: PropTypes.string,
  user: PropTypes.object
};

export default RoutePage;
