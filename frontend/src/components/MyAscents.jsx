import React, { useState, useEffect } from 'react';
import { mockBoulders, mockRoutes } from '../mockData';
import { useAscents } from '../contexts/AscentsContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/MyAscents.css';

/**
 * MyAscents displays a user's logged ascents (ticklist), with filters and stats.
 */
const MyAscents = ({ onDeleteAscent, onEditAscent }) => {
  // Get data from contexts
  const { user } = useAuth();
  const { ascents, loading, calculateStats } = useAscents();
  const [filter, setFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Helper to get climb details
  const getClimbDetails = (ascent) => {
    const climbs = ascent.climb_type === 'boulder' ? mockBoulders : mockRoutes;
    return climbs.find(c => c.name === ascent.climb_name) || {};
  };

  // Filter by search and filter
  let filteredAscents = ascents.filter(a => {
    if (filter === 'sent' && !a.sent) return false;
    if (filter === 'project' && a.sent) return false;
    if (!search.trim()) return true;
    const details = getClimbDetails(a);
    const haystack = [
      a.climb_name,
      a.personal_grade,
      details.section,
      details.setter,
      details.description,
      a.notes
    ].join(' ').toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  // Sorting
  filteredAscents = filteredAscents.slice().sort((a, b) => {
    if (sortBy === 'date') {
      return b.date.localeCompare(a.date);
    } else if (sortBy === 'grade') {
      return (b.personal_grade || '').localeCompare(a.personal_grade || '');
    } else if (sortBy === 'quality') {
      return (b.quality || 0) - (a.quality || 0);
    }
    return 0;
  });

  // Delete with undo
  const handleDelete = (id) => {
    setPendingDelete(id);
    const timeout = setTimeout(() => {
      onDeleteAscent(id);
      setPendingDelete(null);
    }, 4000);
    setUndoTimeout(timeout);
  };
  const handleUndo = () => {
    clearTimeout(undoTimeout);
    setPendingDelete(null);
  };

  // Compute hardest grade (simple lexicographical for now)
  function getHardestGrade(type) {
    const grades = ascents.filter(a => a.sent && a.climb_type === type && a.personal_grade).map(a => a.personal_grade);
    if (!grades.length) return 'N/A';
    return grades.sort().reverse()[0];
  }
  // Most frequent grade
  function getMostFrequentGrade() {
    const freq = {};
    ascents.forEach(a => {
      if (a.personal_grade) freq[a.personal_grade] = (freq[a.personal_grade] || 0) + 1;
    });
    const max = Math.max(...Object.values(freq), 0);
    const grades = Object.keys(freq).filter(g => freq[g] === max);
    return grades.length ? grades.join(', ') : 'N/A';
  }
  // Send streak (consecutive days with at least one sent ascent)
  function getSendStreak() {
    const sentDates = Array.from(new Set(ascents.filter(a => a.sent).map(a => a.date))).sort().reverse();
    if (!sentDates.length) return 0;
    let streak = 1;
    let prev = new Date(sentDates[0]);
    for (let i = 1; i < sentDates.length; ++i) {
      const curr = new Date(sentDates[i]);
      const diff = (prev - curr) / (1000*60*60*24);
      if (diff === 1) {
        streak++;
        prev = curr;
      } else {
        break;
      }
    }
    return streak;
  }
  // Unique climbs
  function getUniqueClimbs() {
    return new Set(ascents.map(a => a.climb_name)).size;
  }

  const stats = {
    total: ascents.length,
    sent: ascents.filter(a => a.sent).length,
    project: ascents.filter(a => !a.sent).length,
    hardestBoulder: getHardestGrade('boulder'),
    hardestRoute: getHardestGrade('route'),
    mostFrequent: getMostFrequentGrade(),
    sendStreak: getSendStreak(),
    uniqueClimbs: getUniqueClimbs()
  };


  return (
    <div className="my-ascents">
      <h2>My Ascents</h2>
      <div className="filters" role="group" aria-label="Filter ascents">
        <button onClick={() => setFilter('all')} className={filter==='all' ? 'active' : ''} aria-label="Show all ascents">All</button>
        <button onClick={() => setFilter('sent')} className={filter==='sent' ? 'active' : ''} aria-label="Show sent ascents">Sent</button>
        <button onClick={() => setFilter('project')} className={filter==='project' ? 'active' : ''} aria-label="Show project ascents">Project</button>
      </div>
      <div className="search-sort-row" style={{display: 'flex', gap: '1rem', alignItems: 'center', margin: '1rem 0'}}>
        <input
          type="text"
          placeholder="Search by climb, grade, notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search ascents"
          style={{flex: 2, minWidth: 0}}
        />
        <label htmlFor="sort-by" style={{fontWeight: 600}}>Sort by:</label>
        <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort ascents by" style={{flex: 1, minWidth: 120}}>
          <option value="date">Date (newest)</option>
          <option value="grade">Grade (desc)</option>
          <option value="quality">Quality (desc)</option>
        </select>
      </div>
      <div className="stats">
        <p>Total logged: {stats.total}</p>
        <p>Unique climbs: {stats.uniqueClimbs}</p>
        <p>Sent: {stats.sent}</p>
        <p>Projects: {stats.project}</p>
        <p>Hardest Boulder: {stats.hardestBoulder}</p>
        <p>Hardest Route: {stats.hardestRoute}</p>
        <p>Most Frequent Grade: {stats.mostFrequent}</p>
        <p>Send Streak: {stats.sendStreak} day(s)</p>
      </div>
      <ul className="ascents-list" role="list" aria-label="Logged ascents">
        {filteredAscents.map(a => {
          const details = getClimbDetails(a);
          return (
            <li key={a.id} className={`ascent-item ${a.sent ? 'sent' : 'project'}`} role="listitem" aria-label={`Ascent: ${a.climb_name}, ${a.sent ? 'Sent' : 'Project'}, Grade: ${a.personal_grade || details.setter_grade || 'N/A'}`}> 
              <div className="ascent-row">
                <strong>{a.climb_name}</strong>
                <span className={`badge climb-type ${a.climb_type}`}>{a.climb_type}</span>
                {details.color && (
                  <span className="badge climb-color" style={{backgroundColor: details.color.toLowerCase(), color: '#fff', marginLeft: 8}}>{details.color}</span>
                )}
                <span className={`badge sent-status ${a.sent ? 'sent' : 'project'}`}>{a.sent ? 'Sent' : 'Project'}</span>
                <span className="ascent-date">{a.date}</span>
                <button className="btn-edit" title="Edit" aria-label={`Edit ascent for ${a.climb_name}`} onClick={() => onEditAscent(a)}>✏️</button>
                <button className="btn-delete" title="Delete" aria-label={`Delete ascent for ${a.climb_name}`} onClick={() => handleDelete(a.id)} disabled={pendingDelete === a.id}>🗑️</button>
              </div>
              <div className="ascent-details">
                <span><strong>Grade:</strong> {a.personal_grade || details.setter_grade || 'N/A'}</span>
                {details.section && <span> | <strong>Section:</strong> {details.section}</span>}
                {details.setter && <span> | <strong>Setter:</strong> {details.setter}</span>}
                <span> | <strong>Quality:</strong> {a.quality}/5</span>
              </div>
              {details.description && <div className="ascent-description">{details.description}</div>}
              {a.notes && <div className="ascent-notes"><em>Notes: {a.notes}</em></div>}
            </li>
          );
        })}
      </ul>
      {filteredAscents.length === 0 && <p>No ascents to show.</p>}
      {pendingDelete && (
        <div className="undo-bar" role="alert" aria-live="assertive">
          <span>Ascent deleted.</span>
          <button className="btn-undo" onClick={handleUndo} aria-label="Undo delete ascent">Undo</button>
        </div>
      )}
    </div>
  );
};

MyAscents.propTypes = {
  onDeleteAscent: PropTypes.func.isRequired,
  onEditAscent: PropTypes.func.isRequired
};

export default MyAscents;
