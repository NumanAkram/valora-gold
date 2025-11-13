import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';

const VerifyResetCode = () => {
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
      const response = await authAPI.verifyResetCode(normalizedEmail, normalizedCode);
      if (response.success) {
        showToast(response.message || 'Code verified successfully.', 'success');
        navigate('/reset-password', { state: { email: normalizedEmail, code: normalizedCode } });
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
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-logo-green font-sans">
            Verify Security Code
          </h1>
          <p className="text-sm text-gray-600 font-sans">
            Enter the 6-digit code we sent to your email to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
              placeholder="Enter your registered email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans tracking-widest"
                placeholder="######"
                maxLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-logo-green text-white font-bold py-3 px-4 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetCode;
