/**
 * Utility functions for authentication and role detection
 * This ensures proper role detection based on active tokens, not just localStorage data
 */

/**
 * Determines the active user role based on tokens and localStorage
 * Priority: admin_token > token (regular user token)
 * This prevents role switching on refresh
 */
export const getActiveUserRole = () => {
  try {
    // Check for admin token first - if admin_token exists, user is admin
    const adminToken = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('valora_admin');
    
    if (adminToken && adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        if (parsedAdmin?.role) {
          return {
            role: String(parsedAdmin.role).toLowerCase(),
            isAdmin: true,
            userInfo: parsedAdmin,
            source: 'admin'
          };
        }
      } catch (error) {
        console.error('Failed to parse stored admin data', error);
        // If admin data is corrupted, clear it
        localStorage.removeItem('valora_admin');
        localStorage.removeItem('admin_token');
      }
    }

    // Check for regular user token - if token exists, user is regular user
    const userToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (userToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // If user has admin role but logged in through regular login, still treat as user
        // Admin login requires admin_token
        return {
          role: parsedUser?.role ? String(parsedUser.role).toLowerCase() : 'user',
          isAdmin: false,
          userInfo: parsedUser,
          source: 'user'
        };
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        // If user data is corrupted, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // No active session found
    return {
      role: null,
      isAdmin: false,
      userInfo: null,
      source: null
    };
  } catch (error) {
    console.error('Failed to determine user role', error);
    return {
      role: null,
      isAdmin: false,
      userInfo: null,
      source: null
    };
  }
};

/**
 * Clears all authentication data (both admin and user)
 */
export const clearAllAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('valora_admin');
  localStorage.removeItem('admin_token');
  window.dispatchEvent(new Event('valora-user-updated'));
  window.dispatchEvent(new Event('admin-auth-changed'));
};

/**
 * Checks if user is authenticated (either as admin or regular user)
 */
export const isAuthenticated = () => {
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('token');
  return Boolean(adminToken || userToken);
};

/**
 * Checks if current session is admin session
 */
export const isAdminSession = () => {
  return Boolean(localStorage.getItem('admin_token'));
};

/**
 * Checks if current session is regular user session
 */
export const isUserSession = () => {
  const userToken = localStorage.getItem('token');
  const adminToken = localStorage.getItem('admin_token');
  return Boolean(userToken && !adminToken);
};

