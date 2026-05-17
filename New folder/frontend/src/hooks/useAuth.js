import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { logout } from '../redux/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, token } = useSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  return {
    user,
    isAuthenticated,
    loading,
    token,
    isAdmin,
    isTeacher,
    logout: handleLogout,
  };
};

export default useAuth;