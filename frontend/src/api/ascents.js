/**
 * Ascents API service
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
const ASCENTS_STORAGE_KEY = 'ascents';

/**
 * Get all ascents from storage
 * @returns {Array} Ascents array
 */
const getStoredAscents = () => {
  try {
    const ascents = localStorage.getItem(ASCENTS_STORAGE_KEY);
    return ascents ? JSON.parse(ascents) : [];
  } catch (error) {
    console.error('Error reading ascents:', error);
    return [];
  }
};

/**
 * Save ascents to storage
 * @param {Array} ascents - Ascents array to save
 */
const saveAscents = (ascents) => {
  try {
    localStorage.setItem(ASCENTS_STORAGE_KEY, JSON.stringify(ascents));
  } catch (error) {
    console.error('Error saving ascents:', error);
  }
};

/**
 * Get all ascents for a user
 * @param {Object} params - Query parameters
 * @param {string} params.userId - User ID to filter by
 * @param {string} params.token - Auth token
 * @returns {Promise<Object>} Ascents data
 */
export const getUserAscents = async ({ userId, token }) => {
  // Validate authentication
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // In a real app, this would be a server request with userId in the query
    const allAscents = getStoredAscents();
    const userAscents = allAscents.filter(ascent => 
      ascent.user_id.toString() === userId.toString()
    );
    
    return {
      success: true,
      data: userAscents
    };
  } catch (error) {
    console.error('Error getting user ascents:', error);
    return { success: false, error: 'Failed to load ascents' };
  }
};

/**
 * Add a new ascent
 * @param {Object} ascentData - Ascent data to create
 * @param {string} token - Auth token
 * @returns {Promise<Object>} New ascent data
 */
export const createAscent = async (ascentData, token) => {
  // Validate authentication
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // In a real app, this would be a server request
    const ascents = getStoredAscents();
    
    // Create new ascent with ID
    const newAscent = {
      ...ascentData,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    // Add to storage
    ascents.push(newAscent);
    saveAscents(ascents);
    
    return {
      success: true,
      data: newAscent
    };
  } catch (error) {
    console.error('Error creating ascent:', error);
    return { success: false, error: 'Failed to create ascent' };
  }
};

/**
 * Update an existing ascent
 * @param {number} id - Ascent ID to update
 * @param {Object} ascentData - Updated ascent data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Updated ascent data
 */
export const updateAscent = async (id, ascentData, token) => {
  // Validate authentication
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // In a real app, this would be a server request
    const ascents = getStoredAscents();
    
    // Find ascent index
    const index = ascents.findIndex(a => a.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Ascent not found' };
    }
    
    // Verify user has permission (owns this ascent)
    if (ascents[index].user_id !== ascentData.user_id) {
      return { success: false, error: 'Permission denied' };
    }
    
    // Update ascent
    const updatedAscent = {
      ...ascents[index],
      ...ascentData,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };
    
    ascents[index] = updatedAscent;
    saveAscents(ascents);
    
    return {
      success: true,
      data: updatedAscent
    };
  } catch (error) {
    console.error('Error updating ascent:', error);
    return { success: false, error: 'Failed to update ascent' };
  }
};

/**
 * Delete an ascent
 * @param {number} id - Ascent ID to delete
 * @param {Object} params - Additional parameters
 * @param {number} params.userId - User ID for permission check
 * @param {string} params.token - Auth token
 * @returns {Promise<Object>} Success status
 */
export const deleteAscent = async (id, { userId, token }) => {
  // Validate authentication
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // In a real app, this would be a server request
    const ascents = getStoredAscents();
    
    // Find ascent
    const ascent = ascents.find(a => a.id === id);
    
    if (!ascent) {
      return { success: false, error: 'Ascent not found' };
    }
    
    // Verify user has permission (owns this ascent)
    if (ascent.user_id.toString() !== userId.toString()) {
      return { success: false, error: 'Permission denied' };
    }
    
    // Remove ascent
    const updatedAscents = ascents.filter(a => a.id !== id);
    saveAscents(updatedAscents);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting ascent:', error);
    return { success: false, error: 'Failed to delete ascent' };
  }
};

/**
 * Get climbing statistics for a user
 * @param {Object} params - Query parameters
 * @param {string} params.userId - User ID 
 * @param {string} params.token - Auth token
 * @returns {Promise<Object>} Statistics data
 */
export const getUserStatistics = async ({ userId, token }) => {
  // This would call getUserAscents and then calculate statistics
  // For now, we'll just reuse the existing stats logic from the component
  const result = await getUserAscents({ userId, token });
  
  if (!result.success) {
    return result;
  }
  
  // We'll just return the raw ascents for now
  // In a real app, we might calculate more complex statistics server-side
  return {
    success: true,
    data: result.data
  };
};
