import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Hash, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../utils/api';

const AdminVerifyResetCode = () => {
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedCode = code.trim();
    const normalizedEmail = email.trim();

    if (normalizedCode.length !== 6) {
      showToast('Please enter the 6-digit verification code.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.adminVerifyResetCode(normalizedEmail, normalizedCode);
      if (response.success) {
        showToast(response.message || 'Code verified successfully.', 'success');
        navigate('/admin/reset-password', { state: { email: normalizedEmail, code: normalizedCode } });
      } else {
        showToast(response.message || 'Invalid or expired code.', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Invalid or expired code.', 'error');
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
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Verify Security Code</h1>
          <p className="text-sm text-gray-500 font-sans">
            Enter the 6-digit code we sent to your admin email to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="email">
              Admin Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              placeholder="Enter your admin email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="code">
              Verification Code
            </label>
            <div className="relative">
              <Hash className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans tracking-widest"
                placeholder="######"
                maxLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-logo-green text-white text-sm font-semibold shadow-md hover:bg-banner-green disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-sans"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminVerifyResetCode;

