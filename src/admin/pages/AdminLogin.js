import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, UserPlus, RefreshCw, Home, User } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getActiveUserRole } from '../../utils/authHelper';
import Spinner from '../../components/Spinner';

const AdminLogin = () => {
  const { login, error: authError, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('valora_admin');
    
    if (isAuthenticated || (adminToken && adminData)) {
      // Admin is already logged in, redirect to admin panel
      navigate('/admin');
    } else {
      // Admin is not logged in - show sign/register option by default (not login form)
      // This way, when user logs out from admin panel, they see the sign/register option first
      setShowLoginForm(false); // Default to showing sign/register option
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }

      const result = await login(formData);
      if (!result.success) {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-logo-green/5 via-white to-yellow-100/10 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl p-8 space-y-8">
        {!showLoginForm ? (
          // Show Sign/Register option when logged out
          <>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-logo-green/10 text-logo-green mb-2">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-sans">Access My Account</h1>
                <p className="text-sm text-gray-500 font-sans">
                  Sign in or register to access your account
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Check if admin is logged in
                  const authInfo = getActiveUserRole();
                  if (authInfo.isAdmin || (authInfo.role && authInfo.role.toLowerCase() === 'admin')) {
                    // Admin is logged in, go to My Account page
                    navigate('/my-account');
                  } else {
                    // Not logged in, go to signin page
                    navigate('/signin');
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-logo-green text-logo-green text-sm font-semibold hover:bg-logo-green hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-normal">Sign or Register in</span>
                  <span className="text-sm font-bold">My Account</span>
                </div>
              </button>
              
              <button
                onClick={() => setShowLoginForm(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Login
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Home className="h-4 w-4" />
                Switch to Home
              </button>
            </div>
          </>
        ) : (
          // Show Admin Login Form
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-logo-green/10 text-logo-green mb-2">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-sans">Admin Panel Access</h1>
              <p className="text-sm text-gray-500 font-sans">
                Sign in with administrator credentials to manage Valora Gold.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 font-sans">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your admin email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 font-sans">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your admin password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                    required
                  />
                </div>
              </div>

              {(error || authError) && (
                <div className="text-sm text-red-600 font-sans bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error || authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-logo-green text-white text-sm font-semibold shadow-md hover:bg-banner-green disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="space-y-3">
              <Link
                to="/admin/forgot-password"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Forgot Password?
              </Link>
              <button
                onClick={() => setShowLoginForm(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                Back to User Account
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Home className="h-4 w-4" />
                Switch to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;

