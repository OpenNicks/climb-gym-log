import React from 'react';
import PropTypes from 'prop-types';
import '../styles/GymList.css';

/**
 * GymList component displays a list of climbing gyms.
 * Allows selection and deletion of gyms.
 */
const GymList = ({ gyms, onSelect, onDelete, selectedGym }) => {
  if (!gyms || gyms.length === 0) {
    return (
      <div className="gym-list-empty">
        <p>No gyms available. Add your first gym to get started!</p>
      </div>
    );
  }

  return (
    <div className="gym-list">
      <div className="gym-list-header">
        <div className="gym-name-header">Name</div>
        <div className="gym-actions-header">Actions</div>
      </div>
      
      <ul className="gym-items">
        {gyms.map(gym => (
          <li key={gym.id} className={`gym-item ${selectedGym && selectedGym.id === gym.id ? 'selected' : ''}`}>
            <div 
              className="gym-name" 
              onClick={() => onSelect(gym)}
            >
              {gym.name}
              {gym.climb_count > 0 && (
                <span className="climb-count">{gym.climb_count} climbs</span>
              )}
            </div>
            
            <div className="gym-actions">
              <button 
                className="btn btn-small" 
                onClick={() => onSelect(gym)}
                aria-label={`View ${gym.name}`}
              >
                View
              </button>
              
              <button 
                className="btn btn-small btn-danger" 
                onClick={() => onDelete(gym.id)}
                aria-label={`Delete ${gym.name}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

GymList.propTypes = {
  gyms: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  selectedGym: PropTypes.object
};

export default GymList;
