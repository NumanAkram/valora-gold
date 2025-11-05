import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, Truck, CheckCircle, Clock, XCircle, Home, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please sign in to view order history', 'error');
        navigate('/signin');
        return;
      }

      try {
        const response = await ordersAPI.getAll();
        if (response.success) {
          setOrders(response.data || []);
        } else {
          showToast('Failed to load order history', 'error');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        showToast('Failed to load order history', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, showToast]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package, label: 'Processing' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck, label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text} font-sans`}>
        <Icon className="h-4 w-4" />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 font-sans">Loading order history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'Order History', path: '/order-history' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-logo-green mb-2 font-sans uppercase tracking-wide">
            Order History
          </h1>
          <p className="text-gray-600 font-sans">
            View all your past orders and their status
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              No Orders Found
            </h3>
            <p className="text-gray-600 mb-8 font-sans">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-logo-green text-white px-6 py-3 rounded-lg hover:bg-banner-green transition-colors font-sans font-medium"
            >
              <Home className="h-5 w-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id || order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="h-5 w-5 text-logo-green" />
                      <h3 className="text-lg font-bold text-gray-900 font-sans">
                        Order #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 font-sans">
                      <Calendar className="h-4 w-4" />
                      <span>Placed on {formatDate(order.createdAt || order.orderDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(order.status)}
                    <Link
                      to={`/order-confirmation/${order._id || order.id}`}
                      className="inline-flex items-center space-x-2 text-logo-green hover:text-banner-green font-semibold font-sans"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 font-sans">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm font-sans">
                          <span className="text-gray-700">
                            {item.product?.name || item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-900 font-semibold">
                            Rs.{((item.price || item.product?.price || 0) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 font-sans">Shipping Address</h4>
                    {order.shippingAddress ? (
                      <div className="text-sm text-gray-700 font-sans">
                        <p className="font-medium">{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                        <p>{order.shippingAddress.postalCode}</p>
                        {order.shippingAddress.phone && (
                          <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 font-sans">No address available</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 font-sans">
                    <span className="font-semibold">Payment Method:</span> {order.paymentMethod || 'N/A'}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-sans mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-logo-green font-sans">
                      Rs.{(order.total || order.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to={`/track-order?orderNumber=${order.trackingNumber}`}
                      className="inline-flex items-center space-x-2 text-logo-green hover:text-banner-green font-semibold font-sans"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Track Order: {order.trackingNumber}</span>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

