// Utility to get the API base URL from environment variables
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper to build full API URLs
export function apiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
