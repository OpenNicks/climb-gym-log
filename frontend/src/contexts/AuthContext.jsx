import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as authApi from '../api/auth';
import { extractApiError } from '../api/auth';

// Create authentication context
const AuthContext = createContext(null);

/**
 * Auth Provider component for handling authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await authApi.getCurrentUser(token);
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // Token invalid or expired
          setToken(null);
          localStorage.removeItem('auth_token');
          setError('Session expired. Please log in again.');
        }
      } catch (err) {
        setError('Failed to load user data.');
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(userData);
      if (response.success) {
        setUser(response.user);
        setToken(response.user.token);
        localStorage.setItem('auth_token', response.user.token);
        return { success: true };
      } else if (response.status) {
        // Real API error structure
        setError(response.message || 'Registration failed');
        return { success: false, error: response.message };
      } else {
        setError(response.error || 'Registration failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      if (err && err.status) {
        setError(err.message || 'Registration failed');
        return { success: false, error: err.message };
      }
      const errorMsg = 'Registration failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in an existing user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login result
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        setUser(response.user);
        setToken(response.user.token);
        localStorage.setItem('auth_token', response.user.token);
        return { success: true };
      } else if (response.status) {
        setError(response.message || 'Login failed');
        return { success: false, error: response.message };
      } else {
        setError(response.error || 'Login failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      if (err && err.status) {
        setError(err.message || 'Login failed');
        return { success: false, error: err.message };
      }
      const errorMsg = 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    setLoading(true);
    
    try {
      await authApi.logout();
      
      // Clean up auth state regardless of API response
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clean up auth state even if API fails
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear any auth errors
   */
  const clearError = () => setError(null);

  // Context value with auth state and methods
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for using auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
