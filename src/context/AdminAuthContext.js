import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('valora_admin');
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (err) {
        console.error('Failed to parse stored admin data', err);
        localStorage.removeItem('valora_admin');
      }
    }
    setLoading(false);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('valora_admin');
    localStorage.removeItem('admin_token');
    setAdmin(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
    setError(null);
    try {
      const response = await adminAPI.login(credentials);
      if (response.success) {
        setAdmin(response.data);
        localStorage.setItem('valora_admin', JSON.stringify(response.data));
        if (response.data?.token) {
          localStorage.setItem('admin_token', response.data.token);
        }
        navigate('/admin');
        return { success: true };
      }
      setError(response.message || 'Invalid credentials');
      return { success: false, message: response.message };
    } catch (err) {
      setError(err.message || 'Failed to login');
      return { success: false, message: err.message };
    }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    clearSession();
    navigate('/admin/login');
  }, [clearSession, navigate]);

  const value = useMemo(
    () => ({
      admin,
      loading,
      error,
      login,
      logout,
      clearSession,
      isAuthenticated: Boolean(admin),
    }),
    [admin, loading, error, login, logout, clearSession]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

