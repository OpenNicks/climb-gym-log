/**
 * Authentication API service
 * Currently mocked but structured for easy backend integration
 */

import { apiUrl } from './apiConfig';

// Helper to extract error details from backend responses
export async function extractApiError(response) {
  let message = 'Unknown error';
  let code = 'unknown_error';
  try {
    const data = await response.json();
    if (data.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (typeof data.detail === 'object') {
        message = data.detail.message || JSON.stringify(data.detail);
        code = data.detail.code || code;
      }
    }
  } catch {
    message = response.statusText || message;
  }
  return { code, message, status: response.status };
}
// For local development/testing without backend
const MOCK_STORAGE_KEY = 'climb_gym_users';

/**
 * Get users from localStorage (mock database)
 * @returns {Array} Users array
 */
const getMockUsers = () => {
  try {
    const users = localStorage.getItem(MOCK_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error reading mock users:', error);
    return [];
  }
};

/**
 * Save users to localStorage (mock database)
 * @param {Array} users - Users array to save
 */
const saveMockUsers = (users) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving mock users:', error);
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data 
 * @returns {Promise<Object>} New user data with token
 */
export const register = async (userData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an API call
  try {
    const users = getMockUsers();
    
    // Check if username or email already exists
    const existingUser = users.find(
      u => u.username === userData.username || (userData.email && u.email === userData.email)
    );
    
    if (existingUser) {
      return { 
        success: false, 
        error: existingUser.username === userData.username 
          ? 'Username already exists' 
          : 'Email already registered'
      };
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email || '',
      createdAt: new Date().toISOString(),
      // In a real app, password would be hashed on the server
    };
    
    // Save user
    users.push(newUser);
    saveMockUsers(users);
    
    // Generate mock token
    const token = `mock-token-${newUser.id}`;
    
    return {
      success: true,
      user: { ...newUser, token }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
};

/**
 * Log in an existing user
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} User data with token
 */
export const login = async (credentials) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an API call
  try {
    const users = getMockUsers();
    
    // Find user by username (could also support email login)
    const user = users.find(u => u.username === credentials.username);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // In a real app, we would verify password here
    
    // Generate mock token
    const token = `mock-token-${user.id}`;
    
    return {
      success: true,
      user: { ...user, token }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
};

/**
 * Get current user data from token
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async (token) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an API call to validate token and get user data
  try {
    if (!token || !token.startsWith('mock-token-')) {
      return { success: false, error: 'Invalid token' };
    }
    
    const userId = parseInt(token.replace('mock-token-', ''));
    const users = getMockUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return {
      success: true,
      user: { ...user, token }
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { success: false, error: 'Failed to get user data' };
  }
};

/**
 * Log out user (in a real app, this might invalidate the token on the server)
 * @returns {Promise<Object>} Success status
 */
export const logout = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true };
};
