// Centralized API logic for climbs, ascents, and comments

export async function addClimb({ name, grade }) {
  const res = await fetch('/api/climbs/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, grade }),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to add climb');
  return res.json();
}

export async function fetchComments(climbId) {
  const res = await fetch(`/climbs/${climbId}/comments`);
  if (!res.ok) throw new Error('Could not fetch comments');
  return res.json();
}

export async function postComment(climbId, commentData, token) {
  const res = await fetch(`/climbs/${climbId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(commentData),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Failed to add comment');
  return res.json();
}

export async function deleteComment(commentId, token) {
  const res = await fetch(`/climbs/comments/${commentId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Failed to delete comment');
  return true;
}
export async function updateClimbRating(climbId, rating, token) {
  const res = await fetch(`/gyms/climbs/${climbId}/rating`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) {
    let msg = 'Failed to update rating';
    try {
      const data = await res.json();
      if (data && data.detail) msg = data.detail;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
export async function fetchAscents(climbId, token) {
  const res = await fetch(`/api/ascents/climb/${climbId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch ascents');
  return res.json();
}

export async function postAscent(ascentData, token) {
  const res = await fetch(`/api/ascents/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(ascentData),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to log ascent');
  }
  return res.json();
}
// Add more API functions as needed (e.g., fetchAscents, postComment, etc.)
