import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNotification } from './NotificationProvider';
import '../styles/ClimbForms.css';

/**
 * AddClimbForm - Component to add a new climb to a gym.
 * 
 * Includes validation and feedback for users.
 */
const AddClimbForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [color, setColor] = useState('');
  const [section, setSection] = useState('');
  const [setter, setSetter] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const { showNotification } = useNotification();
  
  const grades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12'];
  const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Purple', 'Orange', 'Pink', 'Brown', 'Grey', 'Mixed'];
  const sections = ['Main Wall', 'Cave', 'Slab', 'Roof', 'Competition Wall', 'Boulder Island', 'Training Area'];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showNotification('Please enter a climb name', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await onAdd({ 
        name, 
        grade, 
        color, 
        section, 
        setter, 
        description
      });
      
      // Reset form
      setName('');
      setGrade('');
      setColor('');
      setSection('');
      setSetter('');
      setDescription('');
      setExpanded(false);
      
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="climb-form-container">
      {!expanded ? (
        <button 
          className="btn btn-primary climb-form-toggle" 
          onClick={() => setExpanded(true)}
          disabled={submitting}
        >
          + Add New Climb
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="climb-form">
          <div className="form-header">
            <h3>Add New Climb</h3>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setExpanded(false)}
              disabled={submitting}
              aria-label="Close form"
            >
              ×
            </button>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="climbName" className="form-label">Name <span className="required">*</span></label>
              <input
                id="climbName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="e.g., Crimpy Overhang"
                disabled={submitting}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="climbGrade" className="form-label">Grade</label>
              <select
                id="climbGrade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="form-select"
                disabled={submitting}
              >
                <option value="">Select Grade</option>
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="climbColor" className="form-label">Color</label>
              <select
                id="climbColor"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="form-select"
                disabled={submitting}
              >
                <option value="">Select Color</option>
                {colors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="climbSection" className="form-label">Section</label>
              <select
                id="climbSection"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="form-select"
                disabled={submitting}
              >
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="climbSetter" className="form-label">Setter</label>
              <input
                id="climbSetter"
                type="text"
                value={setter}
                onChange={(e) => setSetter(e.target.value)}
                className="form-input"
                placeholder="e.g., Alex"
                disabled={submitting}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="climbDescription" className="form-label">Description</label>
            <textarea
              id="climbDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              placeholder="Any notes about the climb..."
              disabled={submitting}
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setExpanded(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Adding...' : 'Add Climb'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

AddClimbForm.propTypes = {
  onAdd: PropTypes.func.isRequired
};

export default AddClimbForm;
