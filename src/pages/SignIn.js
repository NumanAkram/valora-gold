import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { authAPI } from '../utils/api';

const SignIn = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { clearSession: clearAdminSession } = useAdminAuth();

  const avatarInitial = (userInfo?.name || userInfo?.email || 'V').trim().charAt(0).toUpperCase();
  const avatarUrl = userInfo?.profileImage;

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        setUserInfo(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearAdminSession();
    window.dispatchEvent(new Event('valora-user-updated'));
    setIsLoggedIn(false);
    setUserInfo(null);
    showToast('Signed out successfully!', 'success');
    // Redirect to login page after sign out
    navigate('/signin');
    window.location.reload(); // Reload to update auth state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      clearAdminSession();
      const response = await authAPI.login(formData);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      window.dispatchEvent(new Event('valora-user-updated'));
      
      showToast('Successfully signed in!', 'success');
      
      // Redirect to home
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Reload to update auth state
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      showToast(err.message || 'Sign in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {isLoggedIn ? (
          // User is logged in - Show Sign Out UI
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-center">
            <div className="mb-6 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-logo-green/10 flex items-center justify-center text-logo-green font-bold text-xl overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{avatarInitial}</span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-logo-green font-sans mb-4">
                You are Signed In
              </h2>
              {userInfo && (
                <div className="mb-6">
                  <p className="text-gray-700 font-sans text-lg mb-2">
                    <span className="font-semibold">Email:</span> {userInfo.email}
                  </p>
                  {userInfo.name && (
                    <p className="text-gray-700 font-sans text-lg">
                      <span className="font-semibold">Name:</span> {userInfo.name}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300 font-sans flex items-center justify-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
              
              <Link
                to="/"
                className="block w-full bg-logo-green text-white font-bold py-3 px-4 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans text-center"
              >
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div>
              <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-logo-green font-sans">
                Sign In to Your Account
              </h2>
            </div>
            
            <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-sans">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-logo-green focus:ring-logo-green border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-sans">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-logo-green hover:text-banner-green font-sans"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-logo-green text-white font-bold py-3 px-4 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <Link
            to="/signup"
            className="w-full inline-flex items-center justify-center bg-transparent border-2 border-logo-green text-logo-green hover:bg-logo-green hover:text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 font-sans"
          >
            Create a New Account
          </Link>
        </div>
 
        </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default SignIn;
