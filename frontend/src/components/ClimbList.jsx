import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ClimbRating from './ClimbRating';
import ClimbTabs from './ClimbTabs';
import { boulderGrades, routeGrades } from '../mockData';
import { useNotification } from './NotificationProvider';
import '../styles/ClimbList.css';

// Import mock data for demonstration
import { mockClimbs, mockReviews, mockAscents } from '../mockData';

/**
 * ClimbList component displays a list of climbs with sorting and filtering options.
 */
const ClimbList = ({ climbs: propClimbs, onDelete, onRatingChange, token, user }) => {
  // Use mock data if no climbs are provided (for development/demonstration)
  const [climbs, setClimbs] = useState(propClimbs && propClimbs.length > 0 ? propClimbs : mockClimbs);
  const [filteredClimbs, setFilteredClimbs] = useState(climbs);
  const [expandedClimbId, setExpandedClimbId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [sort, setSort] = useState({ field: 'created_at', direction: 'desc' });
  const [selectedFilters, setSelectedFilters] = useState({
    grade: [],
    color: [],
    section: [],
    setter: []
  });
  
  // State for grade display preference
  const [gradeDisplayMode, setGradeDisplayMode] = useState('both'); // 'setter', 'consensus', or 'both'
  
  const { showNotification } = useNotification();
  
  // Extract unique values for filter dropdowns
  const grades = [...new Set(climbs.map(c => c.grade))].sort((a, b) => {
    // Sort V grades numerically
    const numA = parseInt(a.replace('V', ''), 10);
    const numB = parseInt(b.replace('V', ''), 10);
    return numA - numB;
  });
  
  const colors = [...new Set(climbs.map(c => c.color))].sort();
  const sections = [...new Set(climbs.map(c => c.section))].sort();
  const setters = [...new Set(climbs.map(c => c.setter))].sort();
  
  // Update filtered climbs when filters or sort change
  useEffect(() => {
    let result = [...climbs];
    
    // Apply filters
    if (selectedFilters.grade.length > 0) {
      result = result.filter(c => selectedFilters.grade.includes(c.setter_grade) || selectedFilters.grade.includes(c.consensus_grade));
    }
    
    if (selectedFilters.color.length > 0) {
      result = result.filter(c => selectedFilters.color.includes(c.color));
    }
    
    if (selectedFilters.section.length > 0) {
      result = result.filter(c => selectedFilters.section.includes(c.section));
    }
    
    if (selectedFilters.setter.length > 0) {
      result = result.filter(c => selectedFilters.setter.includes(c.setter));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch(sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'grade':
          const gradeA = parseInt(a.setter_grade.replace('V', ''), 10);
          const gradeB = parseInt(b.setter_grade.replace('V', ''), 10);
          comparison = gradeA - gradeB;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'ascent_count':
          comparison = (a.ascent_count || 0) - (b.ascent_count || 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        default:
          comparison = 0;
      }
      
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredClimbs(result);
  }, [climbs, selectedFilters, sort]);
  
  // Update our climbs if props climbs change
  useEffect(() => {
    if (propClimbs && propClimbs.length > 0) {
      setClimbs(propClimbs);
    }
  }, [propClimbs]);
  
  const handleRate = async (climb, newRating) => {
    setLoadingId(climb.id);
    
    try {
      const updated = await updateClimbRating(climb.id, newRating, token);
      
      // Update local state
      const updatedClimbs = climbs.map(c => 
        c.id === climb.id ? { ...c, rating: updated.rating } : c
      );
      
      setClimbs(updatedClimbs);
      
      if (onRatingChange) {
        onRatingChange(updated);
      }
      
      showNotification('Rating updated!', 'success');
    } catch (err) {
      showNotification(err.message || 'Error updating rating', 'error');
    } finally {
      setLoadingId(null);
    }
  };
  
  const handleDelete = (climbId) => {
    if (onDelete) {
      onDelete(climbId);
    } else {
      // For demo mode
      setClimbs(climbs.filter(c => c.id !== climbId));
      showNotification('Climb deleted', 'success');
    }
  };
  
  const handleFilterToggle = (field, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[field].includes(value)) {
        newFilters[field] = newFilters[field].filter(f => f !== value);
      } else {
        newFilters[field].push(value);
      }
      return newFilters;
    });
  };
  
  const handleSortChange = (field) => {
    setSort(prev => ({ 
      field, 
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc' 
    }));
  };
  
  const getSortIndicator = (field) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? ' ▲' : ' ▼';
  };
  
  const toggleClimbDetails = (climbId) => {
    setExpandedClimbId(expandedClimbId === climbId ? null : climbId);
  };

  if (!filteredClimbs || filteredClimbs.length === 0) {
    return (
      <div className="climb-list-empty">
        <p>No climbs match your criteria. Try changing your filters.</p>
        {Object.values(selectedFilters).some(f => f.length > 0) && (
          <button className="btn btn-outline" onClick={() => setSelectedFilters({ grade: [], color: [], section: [], setter: [] })}>
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="climb-list-container">
      <div className="climb-filters">
        <div className="filter-row">
          <div className="filter-search">
            <input
              type="text"
              placeholder="Search climbs..."
              value={''}
              onChange={(e) => {}}
              className="form-input"
            />
          </div>
          
          <div className="filter-options">
            <div className="filter-section">
              <div className="filter-header">
                <h3>Grade</h3>
                <button className="clear-btn" onClick={() => setSelectedFilters({...selectedFilters, grade: []})}>Clear</button>
              </div>
              <div className="filter-options grade-filters">
                {climbType === 'boulder' ? 
                  boulderGrades.map(grade => (
                    <button 
                      key={grade} 
                      className={`filter-btn ${selectedFilters.grade.includes(grade) ? 'active' : ''}`}
                      onClick={() => handleFilterToggle('grade', grade)}
                    >
                      {grade}
                    </button>
                  )) : 
                  routeGrades.map(grade => (
                    <button 
                      key={grade} 
                      className={`filter-btn ${selectedFilters.grade.includes(grade) ? 'active' : ''}`}
                      onClick={() => handleFilterToggle('grade', grade)}
                    >
                      {grade}
                    </button>
                  ))
                }
              </div>
            </div>
            
            <div className="filter-section">
              <div className="filter-header">
                <h3>Color</h3>
              </div>
              <div className="filter-options">
                <select 
                  value={''} 
                  onChange={(e) => {}}
                  className="form-select"
                >
                  <option value="">All Colors</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filter-section">
              <div className="filter-header">
                <h3>Section</h3>
              </div>
              <div className="filter-options">
                <select 
                  value={''} 
                  onChange={(e) => {}}
                  className="form-select"
                >
                  <option value="">All Sections</option>
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filter-section">
              <div className="filter-header">
                <h3>Setter</h3>
              </div>
              <div className="filter-options">
                <select 
                  value={''} 
                  onChange={(e) => {}}
                  className="form-select"
                >
                  <option value="">All Setters</option>
                  {setters.map(setter => (
                    <option key={setter} value={setter}>{setter}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {Object.values(selectedFilters).some(f => f.length > 0) && (
          <div className="active-filters">
            <div className="filter-tags">
              {selectedFilters.grade.length > 0 && (
                <div className="filter-tag">
                  <span>Grade: {selectedFilters.grade.join(', ')}</span>
                  <button onClick={() => handleFilterToggle('grade', '')}>×</button>
                </div>
              )}
              
              {selectedFilters.color.length > 0 && (
                <div className="filter-tag">
                  <span>Color: {selectedFilters.color.join(', ')}</span>
                  <button onClick={() => handleFilterToggle('color', '')}>×</button>
                </div>
              )}
              
              {selectedFilters.section.length > 0 && (
                <div className="filter-tag">
                  <span>Section: {selectedFilters.section.join(', ')}</span>
                  <button onClick={() => handleFilterToggle('section', '')}>×</button>
                </div>
              )}
              
              {selectedFilters.setter.length > 0 && (
                <div className="filter-tag">
                  <span>Setter: {selectedFilters.setter.join(', ')}</span>
                  <button onClick={() => handleFilterToggle('setter', '')}>×</button>
                </div>
              )}
            </div>
            
            <button className="btn btn-small btn-outline" onClick={() => setSelectedFilters({ grade: [], color: [], section: [], setter: [] })}>
              Clear All
            </button>
          </div>
        )}
      </div>
      
      <div className="climb-results-header">
        <div className="results-count">
          {filteredClimbs.length} climbs found
        </div>
        
        <div className="sort-options">
          <span>Sort by:</span>
          <button 
            className={`sort-button ${sort.field === 'name' ? 'active' : ''}`} 
            onClick={() => handleSortChange('name')}
          >
            Name{getSortIndicator('name')}
          </button>
          <button 
            className={`sort-button ${sort.field === 'grade' ? 'active' : ''}`} 
            onClick={() => handleSortChange('grade')}
          >
            Grade{getSortIndicator('grade')}
          </button>
          <button 
            className={`sort-button ${sort.field === 'rating' ? 'active' : ''}`} 
            onClick={() => handleSortChange('rating')}
          >
            Rating{getSortIndicator('rating')}
          </button>
          <button 
            className={`sort-button ${sort.field === 'ascent_count' ? 'active' : ''}`} 
            onClick={() => handleSortChange('ascent_count')}
          >
            Popularity{getSortIndicator('ascent_count')}
          </button>
          <button 
            className={`sort-button ${sort.field === 'created_at' ? 'active' : ''}`} 
            onClick={() => handleSortChange('created_at')}
          >
            Newest{getSortIndicator('created_at')}
          </button>
        </div>
      </div>
      
      <div className="climb-list">
        {filteredClimbs.map((climb) => (
          <div 
            key={climb.id} 
            className={`climb-card ${expandedClimbId === climb.id ? 'expanded' : ''}`}
          >
            <div className="climb-header" onClick={() => toggleClimbDetails(climb.id)}>
              <div className="climb-name-section">
                <h3 className="climb-name">{climb.name}</h3>
                <div className="climb-tags">
                  <span className="climb-grade">
                    {gradeDisplayMode === 'both' ? (
                      <>
                        <span className="setter-grade" title="Setter grade">
                          {climb.setter_grade}
                        </span>
                        {climb.setter_grade !== climb.consensus_grade && (
                          <span className="grade-arrow">→</span>
                        )}
                        <span className="consensus-grade" title="User consensus grade">
                          {climb.consensus_grade}
                        </span>
                      </>
                    ) : gradeDisplayMode === 'setter' ? (
                      <span className="setter-grade">S: {climb.setter_grade}</span>
                    ) : (
                      <span className="consensus-grade">U: {climb.consensus_grade}</span>
                    )}
                  </span>
                  <span className="climb-color" style={{ 
                    backgroundColor: climb.color.toLowerCase() !== 'mixed' ? climb.color.toLowerCase() : null,
                    color: ['black', 'blue', 'purple'].includes(climb.color.toLowerCase()) ? 'white' : 'black'
                  }}>
                    {climb.color}
                  </span>
                  <span className="climb-section">{climb.section}</span>
                </div>
              </div>
              
              <div className="climb-stats">
                <div className="climb-rating-display">
                  <span className="star-icon">★</span> 
                  <span>{climb.rating || '0.0'}</span>
                  <span className="rating-count">({climb.ascent_count || 0})</span>
                </div>
                
                <div className="climb-setter">
                  Set by: <span>{climb.setter}</span>
                </div>
                
                <div className="climb-date">
                  {new Date(climb.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {expandedClimbId === climb.id && (
              <div className="climb-details">
                <div className="climb-description">
                  <p>{climb.description}</p>
                </div>
                
                <div className="climb-actions">
                  <div className="climb-rating-section">
                    <h4>My Rating</h4>
                    {user && token ? (
                      <div className="climb-rating-control">
                        <ClimbRating
                          rating={climb.user_rating || 0}
                          onRate={(r) => handleRate(climb, r)}
                          disabled={loadingId === climb.id}
                        />
                        {loadingId === climb.id && <div className="loader-small"></div>}
                      </div>
                    ) : (
                      <p className="text-muted">Login to rate</p>
                    )}
                  </div>
                  
                  <div className="climb-meta-actions">
                    <button className="btn btn-small">Log Ascent</button>
                    {user && user.admin && (
                      <button 
                        className="btn btn-small btn-danger" 
                        onClick={() => handleDelete(climb.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                <ClimbTabs 
                  climbId={climb.id} 
                  token={token} 
                  user={user} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="climb-list-pagination">
        <button className="btn btn-outline" disabled>Previous</button>
        <span className="page-info">Page 1 of {Math.ceil(filteredClimbs.length / 10)}</span>
        <button className="btn btn-outline">Next</button>
      </div>
    </div>
  );
};

ClimbList.propTypes = {
  climbs: PropTypes.array,
  onDelete: PropTypes.func,
  onRatingChange: PropTypes.func,
  token: PropTypes.string,
  user: PropTypes.object
};

export default ClimbList;
