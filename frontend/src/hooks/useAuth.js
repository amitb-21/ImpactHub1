import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { getCurrentUser } from '../store/slices/authSlice';

/**
 * useAuth Hook
 * Provides authentication state and methods
 * 
 * Returns:
 * - user: Current user object
 * - token: JWT token
 * - isAuthenticated: Whether user is logged in
 * - isLoading: Loading state
 * - error: Error message
 * - loadUser: Function to reload current user
 * - isAdmin: Whether user is admin
 * - isModerator: Whether user is moderator
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  // Load user on mount if token exists
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  const loadUser = useCallback(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [token, dispatch]);

  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const isModerator = useCallback(() => {
    return user?.role === 'moderator' || user?.role === 'admin';
  }, [user]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    loadUser,
    isAdmin,
    isModerator
  };
};

export default useAuth;