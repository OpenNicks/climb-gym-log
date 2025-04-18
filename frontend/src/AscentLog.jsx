import React, { useState } from "react";
import PropTypes from "prop-types";
import { fetchAscents, postAscent } from './api/climbs';
import { useNotification } from './components/NotificationProvider';

/**
 * AscentLog - Log a new ascent for a climb and view ascent history.
 *
 * Props:
 *   climbId (int): The climb to log an ascent for.
 *   token (string): Auth token for API requests.
 */
export default function AscentLog({ climbId, token }) {
  const [grade, setGrade] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [ascents, setAscents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { showNotification } = useNotification();

  const loadAscents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAscents(climbId, token);
      setAscents(data);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (climbId) loadAscents();
    // eslint-disable-next-line
  }, [climbId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await postAscent({ climb_id: climbId, grade, notes, date }, token);
      setSuccess("Ascent logged!");
      showNotification("Ascent logged!", 'success');
      loadAscents();
      setGrade("");
      setNotes("");
      setDate("");
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

    return (
    <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginTop: 16 }}>
      <h3>Log an Ascent</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <label>
          Grade:
          <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. V3, 5.11a" />
        </label>
        <label style={{ marginLeft: 8 }}>
          Date:
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>
        <label style={{ marginLeft: 8 }}>
          Notes:
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" />
        </label>
        <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
          Log Ascent
        </button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      <h4>Ascent History</h4>
      {loading ? (
        <div>Loading...</div>
      ) : ascents.length === 0 ? (
        <div>No ascents logged yet.</div>
      ) : (
        <ul>
          {ascents.map(a => (
            <li key={a.id}>
              <b>{a.grade}</b> on {a.date ? new Date(a.date).toLocaleDateString() : "Unknown date"}
              {a.notes && <> — {a.notes}</>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

AscentLog.propTypes = {
  climbId: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
};
