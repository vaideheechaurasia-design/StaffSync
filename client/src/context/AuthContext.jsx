import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService.js';

const AuthContext = createContext(null);

/**
 * Normalizes user object to guarantee property consistency across navigation and views.
 *
 * @param {Object} rawUser - User profile returned from the API
 * @returns {Object|null}
 */
function normalizeUser(rawUser) {
  if (!rawUser) return null;

  const parts = (rawUser.name || '').trim().split(/\s+/);
  const firstName = rawUser.firstName || parts[0] || rawUser.email?.split('@')[0] || 'User';
  const lastName = rawUser.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '');
  const initials = `${firstName[0] || ''}${lastName[0] || (firstName.length > 1 ? firstName[1] : '')}`.toUpperCase();

  return {
    ...rawUser,
    id: rawUser.id || rawUser._id,
    name: rawUser.name || `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    initials
  };
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session on initial application load
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.getMe();
      if (response && response.success && response.data?.user) {
        const normalized = normalizeUser(response.data.user);
        setCurrentUser(normalized);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      // An unauthenticated session (401) on initial load is expected when the user is not logged in
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Authenticates user via live credentials.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} The authenticated user profile
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login({ email, password });
      if (response && response.success && response.data?.user) {
        const normalized = normalizeUser(response.data.user);
        setCurrentUser(normalized);
        setIsAuthenticated(true);
        return normalized;
      }
      throw new Error(response?.message || 'Login failed.');
    } catch (err) {
      const message = err.message || 'Invalid email or password.';
      setAuthError(message);
      setIsAuthenticated(false);
      setCurrentUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out user by clearing the server-side cookie and resetting local session.
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout notification:', err.message);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated,
        isLoading,
        authError,
        login,
        logout,
        restoreSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
