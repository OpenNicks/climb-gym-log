import React, { useEffect, useState } from 'react';
import { fetchComments, postComment, deleteComment } from './api/climbs';
import { useNotification } from './components/NotificationProvider';

export default function ClimbComments({ climbId, token, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const { showNotification } = useNotification();

  const loadComments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchComments(climbId);
      setComments(data);
    } catch (e) {
      setError(e.message);
      showNotification(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line
  }, [climbId]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await postComment(climbId, { text }, token);
      setText('');
      setSuccess('Comment added!');
      showNotification('Comment added!', 'success');
      loadComments();
    } catch (e) {
      setError(e.message);
      showNotification(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this comment?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteComment(id, token);
      setSuccess('Comment deleted!');
      showNotification('Comment deleted!', 'success');
      loadComments();
    } catch (e) {
      setError(e.message);
      showNotification(e.message, 'error');
    }
  };

  return (
    <div style={{ marginTop: 16, background: '#fafafa', padding: 12, borderRadius: 8 }}>
      <h4>Comments</h4>
      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <>
          {comments.length === 0 && <div>No comments yet.</div>}
          <ul style={{ paddingLeft: 0 }}>
            {comments.map(c => (
              <li key={c.id} style={{ listStyle: 'none', marginBottom: 8 }}>
                <b>{c.username}</b> <span style={{ color: '#888', fontSize: 12 }}>{new Date(c.created_at).toLocaleString()}</span>
                <div>{c.text}</div>
                {user && c.user_id === user.id && (
                  <button style={{ color: 'red', fontSize: 12 }} onClick={() => handleDelete(c.id)}>Delete</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={submitting}
            style={{ width: '70%' }}
            required
          />
          <button type="submit" disabled={submitting || !text.trim()} style={{ marginLeft: 8 }}>
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      ) : (
        <div style={{ color: '#888', fontSize: 13 }}>Login to comment.</div>
      )}
    </div>
  );
}
