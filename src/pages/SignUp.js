import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';

const SignUp = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      // Don't auto-login after registration, just redirect to login page
      showToast('Account created successfully! Please sign in.', 'success');
      
      // Redirect to login page after registration
      setTimeout(() => {
        navigate('/signin');
      }, 500);
    } catch (err) {
      setError(err.message || 'Registration failed');
      showToast(err.message || 'Registration failed', 'error');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {isLoggedIn ? (
          // User is logged in - Show Sign Out UI
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-center">
            <div className="mb-6">
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
          // User is not logged in - Show Sign Up Form
          <>
            <div>
              <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-logo-green font-sans">
                Create Your Account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 font-sans">
                Already have an account?{' '}
                <Link to="/signin" className="font-medium text-logo-green hover:text-banner-green">
                  Sign in
                </Link>
              </p>
            </div>
            
            <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-sans">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your phone number"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-logo-green text-white font-bold py-3 px-4 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
};

export default SignUp;
