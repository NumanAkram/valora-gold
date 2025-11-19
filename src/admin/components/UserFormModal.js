import React, { useEffect, useState } from 'react';
import { MapPin, Package, Calendar, DollarSign, X } from 'lucide-react';
import Spinner from '../../components/Spinner';
import { adminAPI } from '../../utils/api';

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
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [latestAddress, setLatestAddress] = useState(null);

  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
      });
      setError(null);
      fetchUserOrders(user._id);
    } else if (!open) {
      setFormData(defaultState);
      setError(null);
      setSubmitting(false);
      setOrders([]);
      setLatestAddress(null);
    }
  }, [open, user]);

  const fetchUserOrders = async (userId) => {
    if (!userId) return;
    try {
      setLoadingOrders(true);
      const response = await adminAPI.getUserOrders(userId);
      if (response.success) {
        setOrders(response.data || []);
        // Get latest address from most recent order
        if (response.data && response.data.length > 0) {
          const latestOrder = response.data[0];
          if (latestOrder.shippingAddress) {
            setLatestAddress(latestOrder.shippingAddress);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-auto">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-sans">
              Edit User
            </h2>
            <p className="text-sm text-gray-500 font-sans">
              Update user details, role assignment, and view order history.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* User Details Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

          {/* Latest Shipping Address Section */}
          {latestAddress && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-logo-green" />
                <h3 className="text-sm font-semibold text-gray-900 font-sans uppercase tracking-wide">
                  Latest Shipping Address
                </h3>
              </div>
              <div className="text-sm text-gray-700 font-sans space-y-1">
                <p className="font-medium">{latestAddress.street || 'N/A'}</p>
                <p>
                  {[latestAddress.city, latestAddress.province].filter(Boolean).join(', ') || 'N/A'}
                </p>
                {latestAddress.postalCode && <p>{latestAddress.postalCode}</p>}
                {latestAddress.phone && <p className="mt-1">Phone: {latestAddress.phone}</p>}
              </div>
            </div>
          )}

          {/* Orders Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-logo-green" />
                <h3 className="text-lg font-semibold text-gray-900 font-sans">
                  Order History
                </h3>
              </div>
              <span className="text-sm text-gray-500 font-sans">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {loadingOrders ? (
              <div className="py-8 flex justify-center">
                <Spinner label="Loading orders..." />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order._id || order.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900 font-sans">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold font-sans ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus || 'Pending'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold font-sans ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-sans">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-gray-900">
                              Rs. {order.total?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>
                              {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 font-sans">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No orders found for this user.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;

