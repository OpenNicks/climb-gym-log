import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ClimbComments from './ClimbComments';
import AscentLog from './AscentLog';
import '../styles/ClimbTabs.css';

/**
 * ClimbTabs component handles the tabbed interface for climb details.
 * Includes tabs for comments, ascents, and beta information.
 */
const ClimbTabs = ({ climbId, token, user }) => {
  const [activeTab, setActiveTab] = useState('comments');
  
  return (
    <div className="climb-tabs-container">
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
        <button 
          className={`tab-button ${activeTab === 'ascents' ? 'active' : ''}`}
          onClick={() => setActiveTab('ascents')}
        >
          Ascents
        </button>
        <button 
          className={`tab-button ${activeTab === 'beta' ? 'active' : ''}`}
          onClick={() => setActiveTab('beta')}
        >
          Beta
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'comments' && (
          <ClimbComments 
            climbId={climbId} 
            token={token} 
            user={user} 
          />
        )}
        
        {activeTab === 'ascents' && (
          <AscentLog 
            climbId={climbId} 
            token={token} 
            user={user} 
          />
        )}
        
        {activeTab === 'beta' && (
          <div className="beta-content">
            <div className="beta-placeholder">
              <h4>Beta Videos & Images</h4>
              <p>Share beta videos and images to help others send this climb.</p>
              {user ? (
                <button className="btn btn-secondary">Upload Beta</button>
              ) : (
                <p className="text-muted">Login to share beta</p>
              )}
              
              <div className="beta-examples">
                <div className="example-card">
                  <div className="example-image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                      <line x1="7" y1="2" x2="7" y2="22"></line>
                      <line x1="17" y1="2" x2="17" y2="22"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <line x1="2" y1="7" x2="7" y2="7"></line>
                      <line x1="2" y1="17" x2="7" y2="17"></line>
                      <line x1="17" y1="17" x2="22" y2="17"></line>
                      <line x1="17" y1="7" x2="22" y2="7"></line>
                    </svg>
                  </div>
                  <p>Beta diagrams show key holds and sequences</p>
                </div>
                
                <div className="example-card">
                  <div className="example-image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </div>
                  <p>Video beta shows the full sequence in action</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ClimbTabs.propTypes = {
  climbId: PropTypes.number.isRequired,
  token: PropTypes.string,
  user: PropTypes.object
};

export default ClimbTabs;
