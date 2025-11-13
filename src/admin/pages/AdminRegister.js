import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../utils/api';

const AdminRegister = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await authAPI.register({
        name,
        email,
        phone,
        password,
        role: 'admin',
      });

      showToast('Admin account created successfully! Please sign in.', 'success');
      navigate('/admin/login');
    } catch (err) {
      const message = err.message || 'Failed to create admin account';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-logo-green/5 via-white to-yellow-100/10 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-3xl shadow-xl p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-sans">Create Admin Account</h1>
            <p className="text-sm text-gray-500 font-sans mt-1">
              Use this secure form to provision administrator access for the Valora Gold control panel.
            </p>
          </div>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-logo-green hover:text-banner-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Login
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="03XXXXXXXXX"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="email">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="testing@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="Create a secure password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" htmlFor="confirmPassword">
              Confirm Password
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
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <div className="col-span-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
            <p className="text-xs text-gray-500 font-sans">
              Tip: Share admin credentials only with trusted teammates. You can update or disable access anytime.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-logo-green text-white text-sm font-semibold hover:bg-banner-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
