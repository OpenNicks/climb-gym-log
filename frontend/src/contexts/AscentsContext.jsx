import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as ascentsApi from '../api/ascents';
import { extractApiError } from '../api/ascents';
import { useAuth } from './AuthContext';
import { useNotification } from '../components/NotificationProvider';

// Create ascents context
const AscentsContext = createContext(null);

/**
 * Ascents Provider component for managing user climbing data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AscentsProvider = ({ children }) => {
  const [ascents, setAscents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  // Load user's ascents whenever authentication changes
  useEffect(() => {
    const loadUserAscents = async () => {
      if (!isAuthenticated || !user) {
        setAscents([]);
        return;
      }

      setLoading(true);
      try {
        const response = await ascentsApi.getUserAscents({
          userId: user.id,
          token: user.token
        });
        
        if (response.success) {
          setAscents(response.data);
        } else if (response.status) {
          setError(response.message || 'Failed to load ascents');
          showNotification(response.message || 'Failed to load ascents', 'error');
        } else {
          setError(response.error || 'Failed to load ascents');
          showNotification('Failed to load ascents', 'error');
        }
      } catch (err) {
        if (err && err.status) {
          setError(err.message || 'Failed to load ascents');
          showNotification(err.message || 'Failed to load ascents', 'error');
        } else {
          setError('Error loading ascents');
          showNotification('Error loading ascents', 'error');
        }
        console.error('Ascents loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserAscents();
  }, [isAuthenticated, user, showNotification]);

  /**
   * Add a new ascent
   * @param {Object} ascentData - Ascent data to add
   * @returns {Promise<Object>} Result of operation
   */
  const addAscent = async (ascentData) => {
    if (!isAuthenticated || !user) {
      const error = 'Authentication required';
      showNotification(error, 'error');
      return { success: false, error };
    }

    setLoading(true);
    try {
      const response = await ascentsApi.createAscent(
        {
          ...ascentData,
          user_id: user.id,
          username: user.username
        },
        user.token
      );
      
      if (response.success) {
        setAscents(prevAscents => [response.data, ...prevAscents]);
        showNotification('Ascent logged successfully', 'success');
        return { success: true, data: response.data };
      } else if (response.status) {
        setError(response.message || 'Failed to log ascent');
        showNotification(response.message || 'Failed to log ascent', 'error');
        return { success: false, error: response.message };
      } else {
        setError(response.error || 'Failed to log ascent');
        showNotification('Failed to log ascent', 'error');
        return { success: false, error: response.error };
      }
    } catch (err) {
      if (err && err.status) {
        setError(err.message || 'Failed to log ascent');
        showNotification(err.message || 'Failed to log ascent', 'error');
        return { success: false, error: err.message };
      }
      const errorMsg = 'Error logging ascent';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      console.error('Ascent creation error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing ascent
   * @param {number} id - ID of ascent to update
   * @param {Object} ascentData - Updated ascent data
   * @returns {Promise<Object>} Result of operation
   */
  const updateAscent = async (id, ascentData) => {
    if (!isAuthenticated || !user) {
      const error = 'Authentication required';
      showNotification(error, 'error');
      return { success: false, error };
    }

    setLoading(true);
    try {
      const response = await ascentsApi.updateAscent(
        id,
        {
          ...ascentData,
          user_id: user.id,
          username: user.username
        },
        user.token
      );
      
      if (response.success) {
        setAscents(prevAscents => 
          prevAscents.map(a => a.id === id ? response.data : a)
        );
        showNotification('Ascent updated successfully', 'success');
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to update ascent');
        showNotification('Failed to update ascent', 'error');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = 'Error updating ascent';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      console.error('Ascent update error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete an ascent
   * @param {number} id - ID of ascent to delete
   * @returns {Promise<Object>} Result of operation
   */
  const deleteAscent = async (id) => {
    if (!isAuthenticated || !user) {
      const error = 'Authentication required';
      showNotification(error, 'error');
      return { success: false, error };
    }

    setLoading(true);
    try {
      const response = await ascentsApi.deleteAscent(id, {
        userId: user.id,
        token: user.token
      });
      
      if (response.success) {
        setAscents(prevAscents => prevAscents.filter(a => a.id !== id));
        showNotification('Ascent deleted successfully', 'success');
        return { success: true };
      } else {
        setError(response.error || 'Failed to delete ascent');
        showNotification('Failed to delete ascent', 'error');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = 'Error deleting ascent';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      console.error('Ascent deletion error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate statistics for the user's ascents
   * @returns {Object} Stats data
   */
  const calculateStats = () => {
    if (!ascents.length) {
      return {
        total: 0,
        sent: 0,
        project: 0,
        hardestBoulder: 'N/A',
        hardestRoute: 'N/A',
        mostFrequent: 'N/A',
        sendStreak: 0,
        uniqueClimbs: 0
      };
    }

    // Compute hardest grade
    const getHardestGrade = (type) => {
      const grades = ascents
        .filter(a => a.sent && a.climb_type === type && a.personal_grade)
        .map(a => a.personal_grade);
      if (!grades.length) return 'N/A';
      return grades.sort().reverse()[0];
    };

    // Most frequent grade
    const getMostFrequent = () => {
      const freq = {};
      ascents.forEach(a => {
        if (a.personal_grade) freq[a.personal_grade] = (freq[a.personal_grade] || 0) + 1;
      });
      const max = Math.max(...Object.values(freq), 0);
      const grades = Object.keys(freq).filter(g => freq[g] === max);
      return grades.length ? grades.join(', ') : 'N/A';
    };

    // Send streak
    const getSendStreak = () => {
      const sentDates = Array.from(
        new Set(ascents.filter(a => a.sent).map(a => a.date))
      ).sort().reverse();
      
      if (!sentDates.length) return 0;
      
      let streak = 1;
      let prev = new Date(sentDates[0]);
      
      for (let i = 1; i < sentDates.length; ++i) {
        const curr = new Date(sentDates[i]);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        
        if (diff === 1) {
          streak++;
          prev = curr;
        } else {
          break;
        }
      }
      
      return streak;
    };

    const calculatedStats = {
      total: ascents.length,
      sent: ascents.filter(a => a.sent).length,
      project: ascents.filter(a => !a.sent).length,
      hardestBoulder: getHardestGrade('boulder'),
      hardestRoute: getHardestGrade('route'),
      mostFrequent: getMostFrequent(),
      sendStreak: getSendStreak(),
      uniqueClimbs: new Set(ascents.map(a => a.climb_name)).size
    };

    setStats(calculatedStats);
    return calculatedStats;
  };

  /**
   * Get climbing statistics for the current user
   * @param {boolean} refresh - Whether to refresh stats from API
   * @returns {Promise<Object>} Statistics data
   */
  const getStats = async (refresh = false) => {
    if (stats && !refresh) {
      return { success: true, data: stats };
    }

    if (!isAuthenticated || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // If we have local ascents, just use them
    if (ascents.length > 0 && !refresh) {
      const calculatedStats = calculateStats();
      return { success: true, data: calculatedStats };
    }

    setLoading(true);
    try {
      // We could call a dedicated stats API endpoint here
      // For now, we'll just recalculate based on our ascents
      const calculatedStats = calculateStats();
      return { success: true, data: calculatedStats };
    } catch (err) {
      console.error('Error getting stats:', err);
      return { success: false, error: 'Failed to load statistics' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear any ascent-related errors
   */
  const clearError = () => setError(null);

  // Context value with ascent state and methods
  const value = {
    ascents,
    stats,
    loading,
    error,
    addAscent,
    updateAscent,
    deleteAscent,
    getStats,
    calculateStats,
    clearError,
  };

  return (
    <AscentsContext.Provider value={value}>
      {children}
    </AscentsContext.Provider>
  );
};

AscentsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for using ascents context
 * @returns {Object} Ascents context value
 */
export const useAscents = () => {
  const context = useContext(AscentsContext);
  if (!context) {
    throw new Error('useAscents must be used within an AscentsProvider');
  }
  return context;
};

export default AscentsContext;
