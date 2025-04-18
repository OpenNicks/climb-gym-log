import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNotification } from './NotificationProvider';
import '../styles/ClimbComments.css';

// Import mock data
import { mockReviews, mockUsers } from '../mockData';

/**
 * ClimbComments component displays and manages comments for a specific climb.
 */
const ClimbComments = ({ climbId, token, user }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'rating'

  const { showNotification } = useNotification();

  useEffect(() => {
    // Load mock comments for development/demo
    loadComments();
  }, [climbId, sortOrder]);

  const loadComments = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In production, this would be an API call
      // const data = await fetchComments(climbId);
      
      // For development, use mock data
      // Filter reviews for this climb
      let data = mockReviews.filter(review => review.climb_id === climbId);
      
      // Apply sorting
      data = sortComments(data, sortOrder);
      
      setComments(data);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const sortComments = (comments, order) => {
    const sortedComments = [...comments];
    
    switch (order) {
      case 'newest':
        return sortedComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sortedComments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'rating':
        return sortedComments.sort((a, b) => b.rating - a.rating);
      default:
        return sortedComments;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    if (!text.trim()) {
      showNotification('Comment cannot be empty', 'error');
      setSubmitting(false);
      return;
    }
    
    try {
      // In production, this would be a real API call
      // await postComment(climbId, { text }, token);
      
      // For development, create a mock comment
      const newComment = {
        id: comments.length ? Math.max(...comments.map(c => c.id)) + 1 : 1,
        climb_id: climbId,
        user_id: user?.id || 11, // Use demo user as fallback
        username: user?.username || 'demo',
        rating: 5, // Default rating
        comment: text,
        created_at: new Date().toISOString()
      };
      
      // Add to local state
      const updatedComments = sortComments([newComment, ...comments], sortOrder);
      setComments(updatedComments);
      
      setText('');
      showNotification('Comment added!', 'success');
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      // In production, this would be a real API call
      // await deleteComment(id, token);
      
      // For development, just remove from state
      setComments(comments.filter(c => c.id !== id));
      showNotification('Comment deleted!', 'success');
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };
  
  const toggleComment = (commentId) => {
    setExpandedCommentId(expandedCommentId === commentId ? null : commentId);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const calculateTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return '1 year ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return '1 month ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return '1 day ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return '1 hour ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return '1 minute ago';
    
    return 'just now';
  };

  return (
    <div className="comments-container">
      <div className="comments-header">
        <h4>Comments ({comments.length})</h4>
        <div className="comments-sort">
          <label htmlFor="sortOrder">Sort by:</label>
          <select 
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>
      
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            placeholder="Add your comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            className="form-input"
            rows="2"
            required
          />
          <div className="comment-form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !text.trim()}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Please log in to leave a comment.</p>
        </div>
      )}
      
      {loading ? (
        <div className="comments-loading">
          <div className="loader"></div>
          <p>Loading comments...</p>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          
          {comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <ul className="comments-list">
              {comments.map(comment => (
                <li key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-user">
                      <span className="username">{comment.username}</span>
                      <div className="comment-rating">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`star ${i < comment.rating ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="comment-meta">
                      <span className="comment-time" title={formatDate(comment.created_at)}>
                        {calculateTimeAgo(comment.created_at)}
                      </span>
                      {user && (user.id === comment.user_id || user.admin) && (
                        <button 
                          className="delete-button" 
                          onClick={() => handleDelete(comment.id)}
                          aria-label="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className={`comment-content ${expandedCommentId === comment.id ? 'expanded' : ''}`}
                    onClick={() => toggleComment(comment.id)}
                  >
                    <p>{comment.comment}</p>
                  </div>
                  
                  {comment.comment.length > 150 && expandedCommentId !== comment.id && (
                    <button 
                      className="expand-button"
                      onClick={() => toggleComment(comment.id)}
                    >
                      Read more
                    </button>
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

ClimbComments.propTypes = {
  climbId: PropTypes.number.isRequired,
  token: PropTypes.string,
  user: PropTypes.object
};

export default ClimbComments;
