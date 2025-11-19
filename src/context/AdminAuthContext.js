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
    const adminToken = localStorage.getItem('admin_token');
    
    // Only restore admin session if both admin data and token exist
    // This ensures we don't restore admin session when regular user is logged in
    if (storedAdmin && adminToken) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (err) {
        console.error('Failed to parse stored admin data', err);
        localStorage.removeItem('valora_admin');
        localStorage.removeItem('admin_token');
      }
    } else if (storedAdmin && !adminToken) {
      // Clean up orphaned admin data without token
      localStorage.removeItem('valora_admin');
    }
    setLoading(false);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('valora_admin');
    localStorage.removeItem('admin_token');
    setAdmin(null);
    window.dispatchEvent(new Event('admin-auth-changed'));
  }, []);

  const login = useCallback(
    async (credentials) => {
    setError(null);
    try {
      // Clear regular user session when admin logs in
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('valora-user-updated'));
      
      const response = await adminAPI.login(credentials);
      if (response.success) {
        setAdmin(response.data);
        localStorage.setItem('valora_admin', JSON.stringify(response.data));
        if (response.data?.token) {
          localStorage.setItem('admin_token', response.data.token);
        }
        window.dispatchEvent(new Event('admin-auth-changed'));
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
    window.dispatchEvent(new Event('admin-auth-changed'));
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

