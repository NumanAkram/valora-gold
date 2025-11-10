import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Spinner from '../../components/Spinner';
import { adminAPI } from '../../utils/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const formatCurrency = (value) => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) {
    return 'Rs.0';
  }
  return `Rs.${numeric.toLocaleString()}`;
};

const OrderDetailsModal = ({ open, orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      if (!open || !orderId) {
        setOrder(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getOrderById(orderId);
        if (isMounted) {
          if (response.success) {
            setOrder(response.data);
          } else {
            setError(response.message || 'Failed to load order details');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load order details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [open, orderId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-sans">
              Order Details
            </h2>
            {order?.orderNumber && (
              <p className="text-sm text-gray-500 font-sans mt-1">
                Order Number: {order.orderNumber}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close order details"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16">
              <Spinner label="Loading order..." />
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-red-600 font-sans text-sm">
              {error}
            </div>
          ) : !order ? (
            <div className="px-6 py-10 text-center text-gray-500 font-sans text-sm">
              Order not found
            </div>
          ) : (
            <div className="px-6 py-6 space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 font-sans uppercase tracking-wide mb-3">
                    Order Overview
                  </h3>
                  <dl className="space-y-2 text-sm text-gray-600 font-sans">
                    <div className="flex justify-between items-center">
                      <dt>Status</dt>
                      <dd>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt>Payment Status</dt>
                      <dd>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            PAYMENT_STATUS_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Placed On</dt>
                      <dd>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Total Amount</dt>
                      <dd className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd>{formatCurrency(order.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Shipping</dt>
                      <dd>{formatCurrency(order.shippingCost)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Discount</dt>
                      <dd>{formatCurrency(order.discount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Payment Method</dt>
                      <dd className="capitalize">{order.paymentMethod || 'N/A'}</dd>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <dt>Tracking #</dt>
                        <dd className="font-medium text-gray-800">
                          {order.trackingNumber}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 font-sans uppercase tracking-wide mb-3">
                    Customer
                  </h3>
                  <dl className="space-y-2 text-sm text-gray-600 font-sans">
                    <div className="flex justify-between">
                      <dt>Name</dt>
                      <dd className="font-medium text-gray-900">
                        {order.user?.name || 'Guest'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Email</dt>
                      <dd>{order.user?.email || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Phone</dt>
                      <dd>{order.user?.phone || order.shippingAddress?.phone || 'N/A'}</dd>
                    </div>
                  </dl>

                  <h3 className="text-sm font-semibold text-gray-700 font-sans uppercase tracking-wide mt-5 mb-3">
                    Shipping Address
                  </h3>
                  <div className="text-sm text-gray-600 font-sans space-y-1">
                    <p>{order.shippingAddress?.street || 'N/A'}</p>
                    <p>
                      {[order.shippingAddress?.city, order.shippingAddress?.province]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </p>
                    <p>{order.shippingAddress?.postalCode || ''}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <header className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 font-sans uppercase tracking-wide">
                    Items ({order.items?.length || 0})
                  </h3>
                </header>

                <ul className="divide-y divide-gray-100">
                  {order.items?.map((item) => (
                    <li key={item._id || `${item.product?._id}-${item.name}`} className="px-5 py-4 flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {item.product?.images?.[0] || item.image ? (
                          <img
                            src={item.product?.images?.[0] || item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 font-sans">
                            {item.name}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 font-sans">
                            {formatCurrency((item.price ?? 0) * (item.quantity ?? 0))}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 font-sans mt-2">
                          <span>Qty: {item.quantity ?? 0}</span>
                          <span>Unit: {formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                  {order.items?.length === 0 && (
                    <li className="px-5 py-6 text-center text-sm text-gray-500 font-sans">
                      No items in this order.
                    </li>
                  )}
                </ul>
              </section>

              {order.notes && (
                <section className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
                  <h3 className="text-sm font-semibold text-yellow-800 font-sans uppercase tracking-wide mb-2">
                    Customer Notes
                  </h3>
                  <p className="text-sm text-yellow-700 font-sans whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;

