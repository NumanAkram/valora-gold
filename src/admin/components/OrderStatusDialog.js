import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Spinner from '../../components/Spinner';

const ORDER_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed'];

const OrderStatusDialog = ({ open, order, onClose, onSubmit }) => {
  const [status, setStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && order) {
      setStatus(order.orderStatus || 'pending');
      setPaymentStatus(order.paymentStatus || 'pending');
      setTrackingNumber(order.trackingNumber || '');
      setError(null);
    } else if (!open) {
      setStatus('pending');
      setPaymentStatus('pending');
      setTrackingNumber('');
      setError(null);
      setSubmitting(false);
    }
  }, [open, order]);

  if (!open || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        status,
        paymentStatus,
        trackingNumber: trackingNumber.trim(),
      });
    } catch (err) {
      setError(err?.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-sans">
              Update Order Status
            </h2>
            <p className="text-xs text-gray-500 font-sans mt-1 uppercase tracking-wide">
              {order.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close status dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
              Order Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
              Tracking Number
            </label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Optional tracking number"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            />
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
                  Updating...
                </>
              ) : (
                'Update Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusDialog;