import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';

const defaultState = {
  name: '',
  email: '',
  phone: '',
  role: 'user',
};

const UserFormModal = ({ open, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(defaultState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
      });
      setError(null);
    } else if (!open) {
      setFormData(defaultState);
      setError(null);
      setSubmitting(false);
    }
  }, [open, user]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      });
    } catch (err) {
      setError(err?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <header className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 font-sans">
            Edit User
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Update user details and role assignment.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
              Full Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
              Phone Number
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional phone number"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            >
              <option value="user">Customer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 font-sans bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-logo-green text-white text-sm font-semibold shadow hover:bg-banner-green disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;

