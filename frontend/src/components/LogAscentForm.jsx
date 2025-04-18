import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import { useAscents } from '../contexts/AscentsContext';
import { mockBoulders, mockRoutes } from '../mockData';
import '../styles/LogAscentForm.css';

/**
 * LogAscentForm allows the user to log a new ascent or project.
 * Suggests existing climbs, allows logging new climbs, and records user notes and ratings.
 */
const LogAscentForm = ({ climbType, onSubmit, editAscent }) => {
  // Get user and ascents from context
  const { user } = useAuth();
  const { ascents } = useAscents();
  const [climbName, setClimbName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedClimb, setSelectedClimb] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sent, setSent] = useState(true);
  const [personalGrade, setPersonalGrade] = useState('');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionsRef = useRef(null);

  // Fuzzy search for climb suggestions
  const climbList = climbType === 'boulder' ? mockBoulders : mockRoutes;
  const handleClimbNameChange = (e) => {
    const value = e.target.value;
    setClimbName(value);
    if (value.length > 1) {
      const filtered = climbList.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
    setSelectedClimb(null);
    setPersonalGrade('');
    setError('');
    setActiveSuggestion(-1);
  };

  // Keyboard navigation for suggestions
  const handleClimbNameKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      handleSuggestionClick(suggestions[activeSuggestion]);
      e.preventDefault();
    }
  };

  const handleSuggestionClick = (climb) => {
    setClimbName(climb.name);
    setSelectedClimb(climb);
    setSuggestions([]);
    setPersonalGrade(climb.setter_grade || '');
    setError('');
  };

  // Prevent duplicate logs for same climb/date
  const isDuplicate = () => {
    return ascents.some(a => a.climb_name === climbName && a.date === date && a.sent === sent);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!climbName.trim()) {
      setError('Climb name is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!personalGrade.trim()) {
      setError('Personal grade is required.');
      return;
    }
    if (isDuplicate()) {
      setError('You already logged this climb for this date and status.');
      return;
    }
    setError('');
    const ascent = {
      id: Date.now(),
      climb_id: selectedClimb ? selectedClimb.id : null,
      climb_name: climbName,
      climb_type: climbType,
      user_id: user?.id || 0,
      username: user?.username || 'demo',
      date,
      sent,
      personal_grade: personalGrade,
      quality,
      notes
    };
    onSubmit(ascent);
    setClimbName('');
    setSelectedClimb(null);
    setPersonalGrade('');
    setQuality(3);
    setNotes('');
    setError('');
    setSuggestions([]);
    setActiveSuggestion(-1);
  };

  return (
    <form className="log-ascent-form" onSubmit={handleSubmit}>
      <label className="log-label" htmlFor="climb-name-input">
        Climb Name
        <input
          id="climb-name-input"
          type="text"
          value={climbName}
          onChange={handleClimbNameChange}
          onKeyDown={handleClimbNameKeyDown}
          placeholder="Start typing..."
          autoComplete="off"
          required
          aria-autocomplete="list"
          aria-controls="climb-suggestion-list"
          aria-activedescendant={activeSuggestion >= 0 && suggestions[activeSuggestion] ? `suggestion-${suggestions[activeSuggestion].id}` : undefined}
          aria-describedby={error ? "climb-error" : undefined}
        />
        {suggestions.length > 0 && (
          <ul
            id="climb-suggestion-list"
            className="suggestions"
            ref={suggestionsRef}
            role="listbox"
            aria-label="Climb suggestions"
          >
            {suggestions.map((climb, idx) => (
              <li
                id={`suggestion-${climb.id}`}
                key={climb.id}
                className={idx === activeSuggestion ? 'active' : ''}
                onClick={() => handleSuggestionClick(climb)}
                role="option"
                aria-selected={idx === activeSuggestion}
                tabIndex={-1}
              >
                {climb.name}
              </li>
            ))}
          </ul>
        )}
        {error && <div id="climb-error" className="form-error" role="alert">{error}</div>}
      </label>
      {selectedClimb && (
        <div className="climb-details">
          <div><strong>Color:</strong> <span className="climb-color" style={{backgroundColor: selectedClimb.color.toLowerCase(), color: '#fff', padding: '2px 8px', borderRadius: '5px'}}>{selectedClimb.color}</span></div>
          <div><strong>Section:</strong> {selectedClimb.section}</div>
          <div><strong>Setter:</strong> {selectedClimb.setter}</div>
          <div><strong>Description:</strong> <span className="climb-desc">{selectedClimb.description}</span></div>
        </div>
      )}
      <label htmlFor="ascent-date">Date
        <input id="ascent-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </label>
      <label htmlFor="ascent-sent">Sent?
        <select id="ascent-sent" value={sent} onChange={e => setSent(e.target.value === 'true')}>
          <option value="true">Sent</option>
          <option value="false">Project</option>
        </select>
      </label>
      <label htmlFor="personal-grade">Personal Grade
        <input id="personal-grade" type="text" value={personalGrade} onChange={e => setPersonalGrade(e.target.value)} placeholder="e.g. V4 or 5.11a" />
      </label>
      <label htmlFor="ascent-quality">Quality (1-5)
        <input id="ascent-quality" type="number" min="1" max="5" value={quality} onChange={e => setQuality(Number(e.target.value))} />
      </label>
      <label htmlFor="ascent-notes">Notes
        <textarea id="ascent-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Beta, thoughts, etc..." />
      </label>
      <button type="submit" className="btn btn-primary" aria-label="Log ascent">Log Ascent</button>
    </form>
  );
};

LogAscentForm.propTypes = {
  climbType: PropTypes.oneOf(['boulder', 'route']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.object
};

export default LogAscentForm;
