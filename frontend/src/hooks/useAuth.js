import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../store/slices/authSlice';

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

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap?.();
    } catch (err) {
      // Even if logout thunk fails, ensure local cleanup
      console.error('Logout error:', err);
    }
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    loadUser,
    isAdmin,
    isModerator,
    logout
  };
};

export default useAuth;