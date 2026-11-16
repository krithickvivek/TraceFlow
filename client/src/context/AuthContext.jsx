/**
 * @file AuthContext.jsx
 * @description Authentication context. Manages user session state, provides
 *              login/register/logout/guest methods, and rehydrates from cookie on mount.
 * @module context/AuthContext
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '../services/api';
import { log, error as logError } from '../utils/logger';

/** localStorage key for guest mode flag. */
const GUEST_KEY = 'traceflow_guest';

const AuthContext = createContext(null);

/**
 * Auth provider that wraps the app and supplies user session state.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === 'true');

  /** Whether the user is authenticated (not guest). */
  const isAuthenticated = !!user;

  /* Rehydrate session from cookie on mount. */
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const data = await authAPI.me();
        if (!cancelled) {
          setUser(data.user);
          /* Clear guest flag if logged in. */
          localStorage.removeItem(GUEST_KEY);
          setIsGuest(false);
        }
      } catch {
        /* No valid session — that's fine. */
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, []);

  /**
   * Log in with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} The user object.
   */
  const login = useCallback(async (email, password) => {
    const data = await authAPI.login(email, password);
    setUser(data.user);
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    log('Logged in:', data.user.email);
    return data.user;
  }, []);

  /**
   * Register a new account.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {object} [extras] - Optional profile fields: role, organization, experience_level, bio.
   * @returns {Promise<object>} The new user object.
   */
  const register = useCallback(async (name, email, password, extras = {}) => {
    const data = await authAPI.register(name, email, password, extras);
    setUser(data.user);
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    log('Registered:', data.user.email);
    return data.user;
  }, []);

  /**
   * Log out and clear the session.
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      logError('Logout API error:', err);
    }
    setUser(null);
  }, []);

  /**
   * Continue as guest — sets a localStorage flag to allow visualizer access.
   */
  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, 'true');
    setIsGuest(true);
    log('Continuing as guest');
  }, []);

  /**
   * Update the user object in context (e.g. after profile edit).
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isGuest,
    login,
    register,
    logout,
    continueAsGuest,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to access auth state and methods.
 *
 * @returns {{
 *   user: object|null,
 *   isLoading: boolean,
 *   isAuthenticated: boolean,
 *   isGuest: boolean,
 *   login: Function,
 *   register: Function,
 *   logout: Function,
 *   continueAsGuest: Function
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
