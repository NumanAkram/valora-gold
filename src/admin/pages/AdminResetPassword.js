import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../utils/api';

const AdminResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const initialEmail = location.state?.email || '';
  const initialCode = location.state?.code || '';
  
  const [formData, setFormData] = useState({
    email: initialEmail,
    code: initialCode,
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialEmail || !initialCode) {
      // Redirect to forgot password if email or code is missing
      navigate('/admin/forgot-password');
    }
  }, [initialEmail, initialCode, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const { email, code, newPassword, confirmPassword } = formData;

    if (!email || !code || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.adminResetPassword(email, code, newPassword);
      if (response.success) {
        showToast('Password updated successfully! You can now sign in.', 'success');
        navigate('/admin/login');
      } else {
        const message = response.message || 'Failed to reset password';
        setError(message);
        showToast(message, 'error');
      }
    } catch (err) {
      const message = err.message || 'Failed to reset password';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-logo-green/5 via-white to-yellow-100/10 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl p-8 space-y-8">
        <div className="space-y-2 text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-logo-green hover:text-banner-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Login
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Reset Admin Password</h1>
          <p className="text-sm text-gray-500 font-sans">
            Enter the verification code and your new password to reset your admin account password.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="email">
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none text-sm font-sans"
              placeholder="Enter admin email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="code">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans tracking-widest"
              placeholder="######"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="Enter your new password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="Re-enter the new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-logo-green text-white text-sm font-semibold shadow-md hover:bg-banner-green disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPassword;
