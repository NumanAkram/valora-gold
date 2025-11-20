import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../utils/api';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.adminRequestPasswordReset(email);
      if (response.success) {
        showToast(response.message || 'Reset code sent to your email.', 'success');
        navigate('/admin/verify-reset-code', { state: { email } });
      } else {
        showToast(response.message || 'Unable to send reset code.', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Unable to send reset code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-logo-green/5 via-white to-yellow-100/10 flex items-center justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl p-8 space-y-8">
        <div className="space-y-2 text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-logo-green hover:text-banner-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Login
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Forgot Admin Password</h1>
          <p className="text-sm text-gray-500 font-sans">
            Enter your admin email address and we'll send you a verification code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="email">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="Enter your admin email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-logo-green text-white text-sm font-semibold shadow-md hover:bg-banner-green disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-sans"
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPassword;

