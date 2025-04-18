import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNotification } from "./NotificationProvider";
import "../styles/AscentLog.css";

// Import mock data
import { mockAscents, mockUsers } from "../mockData";

/**
 * AscentLog - Log a new ascent for a climb and view ascent history.
 *
 * Allows users to log sends, attempts, and view their climbing history for a specific climb.
 */
const AscentLog = ({ climbId, token, user }) => {
  const [grade, setGrade] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attemptCount, setAttemptCount] = useState(1);
  const [sendStatus, setSendStatus] = useState(true);
  const [ascents, setAscents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // all, sends, attempts
  
  const { showNotification } = useNotification();
  
  const grades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12'];
  
  useEffect(() => {
    if (climbId) loadAscents();
  }, [climbId, filter]);

  const loadAscents = async () => {
    setLoading(true);
    setError("");
    
    try {
      // In production, this would be an API call
      // const data = await fetchAscents(climbId, token);
      
      // For development, use mock data
      // Filter ascents for this climb
      let data = mockAscents.filter(ascent => ascent.climb_id === climbId);
      
      // Apply filter
      if (filter === "sends") {
        data = data.filter(ascent => ascent.send === true);
      } else if (filter === "attempts") {
        data = data.filter(ascent => ascent.send === false);
      }
      
      // Sort by date (newest first)
      data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setAscents(data);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // In production, this would be an API call
      // await postAscent({ climb_id: climbId, grade, notes, date, attempts: attemptCount, send: sendStatus }, token);
      
      // For development, create a mock ascent
      const newAscent = {
        id: ascents.length ? Math.max(...ascents.map(a => a.id)) + 1 : 1,
        climb_id: climbId,
        user_id: user?.id || 11, // Use demo user as fallback
        username: user?.username || "demo",
        send: sendStatus,
        attempts: attemptCount,
        grade: grade,
        notes: notes,
        created_at: new Date().toISOString()
      };
      
      // Add to local state
      setAscents([newAscent, ...ascents]);
      
      showNotification("Ascent logged successfully!", "success");
      
      // Reset form
      setGrade("");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      setAttemptCount(1);
      setSendStatus(true);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStats = () => {
    if (!ascents.length) return { sends: 0, attempts: 0, sendRate: 0, highestGrade: "None" };
    
    const sends = ascents.filter(a => a.send).length;
    const attempts = ascents.length;
    const sendRate = Math.round((sends / attempts) * 100);
    
    // Get highest grade sent
    const sendGrades = ascents
      .filter(a => a.send && a.grade)
      .map(a => a.grade)
      .filter(g => g.startsWith("V"))
      .map(g => parseInt(g.replace("V", ""), 10))
      .sort((a, b) => b - a);
      
    const highestGrade = sendGrades.length ? `V${sendGrades[0]}` : "None";
    
    return { sends, attempts, sendRate, highestGrade };
  };
  
  const stats = getStats();

  return (
    <div className="ascent-log-container">
      <div className="ascent-log-header">
        <h4>Ascent Log</h4>
        
        {user && token ? (
          <button 
            className="btn btn-small"
            onClick={() => setShowForm(!showForm)}
            aria-label={showForm ? "Cancel logging" : "Log ascent"}
          >
            {showForm ? "Cancel" : "Log Ascent"}
          </button>
        ) : (
          <div className="login-prompt-small">Login to log ascents</div>
        )}
      </div>
      
      {user && token && showForm && (
        <form onSubmit={handleSubmit} className="ascent-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sendStatus" className="form-label">Status</label>
              <div className="send-status-toggle">
                <button 
                  type="button"
                  className={`status-btn ${sendStatus ? 'active' : ''}`}
                  onClick={() => setSendStatus(true)}
                >
                  Send
                </button>
                <button 
                  type="button"
                  className={`status-btn ${!sendStatus ? 'active' : ''}`}
                  onClick={() => setSendStatus(false)}
                >
                  Attempt
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="attemptCount" className="form-label">Attempts</label>
              <input
                id="attemptCount"
                type="number"
                min="1"
                max="100"
                value={attemptCount}
                onChange={(e) => setAttemptCount(parseInt(e.target.value, 10))}
                className="form-input"
                disabled={submitting}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ascentGrade" className="form-label">Your Grade</label>
              <select
                id="ascentGrade"
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
              <label htmlFor="ascentDate" className="form-label">Date</label>
              <input
                id="ascentDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                max={new Date().toISOString().split("T")[0]}
                disabled={submitting}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="ascentNotes" className="form-label">Notes</label>
            <textarea
              id="ascentNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              placeholder="Any notes about your attempt..."
              disabled={submitting}
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
            >
              {submitting ? "Logging..." : "Log Ascent"}
            </button>
          </div>
        </form>
      )}
      
      {/* Stats Summary */}
      <div className="ascent-stats">
        <div className="stat-item">
          <span className="stat-label">Sends</span>
          <span className="stat-value">{stats.sends}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Attempts</span>
          <span className="stat-value">{stats.attempts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Send Rate</span>
          <span className="stat-value">{stats.sendRate}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Highest Grade</span>
          <span className="stat-value">{stats.highestGrade}</span>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="ascent-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'sends' ? 'active' : ''}`}
          onClick={() => setFilter('sends')}
        >
          Sends
        </button>
        <button 
          className={`filter-btn ${filter === 'attempts' ? 'active' : ''}`}
          onClick={() => setFilter('attempts')}
        >
          Attempts
        </button>
      </div>
      
      {/* Ascent List */}
      {loading ? (
        <div className="ascent-loading">
          <div className="loader"></div>
          <p>Loading ascents...</p>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          
          {ascents.length === 0 ? (
            <div className="no-ascents">
              <p>No ascents logged yet.</p>
            </div>
          ) : (
            <ul className="ascent-list">
              {ascents.map(ascent => (
                <li key={ascent.id} className={`ascent-item ${ascent.send ? 'send' : 'attempt'}`}>
                  <div className="ascent-header">
                    <div className="ascent-info">
                      <span className="ascent-status">
                        {ascent.send ? 'Send' : 'Attempt'}
                      </span>
                      <span className="ascent-user">{ascent.username}</span>
                    </div>
                    <div className="ascent-meta">
                      {ascent.grade && <span className="ascent-grade">{ascent.grade}</span>}
                      <span className="ascent-date">{formatDate(ascent.created_at)}</span>
                    </div>
                  </div>
                  
                  {ascent.attempts > 1 && (
                    <div className="ascent-attempts">
                      {ascent.attempts} attempts
                    </div>
                  )}
                  
                  {ascent.notes && (
                    <div className="ascent-notes">
                      <p>{ascent.notes}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

AscentLog.propTypes = {
  climbId: PropTypes.number.isRequired,
  token: PropTypes.string,
  user: PropTypes.object
};

export default AscentLog;
