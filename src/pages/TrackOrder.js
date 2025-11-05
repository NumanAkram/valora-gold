import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, Home, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';

const TrackOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState(null);

  useEffect(() => {
    // Check if order number is in URL params
    const orderNum = searchParams.get('orderNumber');
    if (orderNum) {
      setOrderNumber(orderNum);
      handleTrackOrder(orderNum);
    }
  }, [searchParams]);

  const handleTrackOrder = async (orderNum = null) => {
    const trackingNumber = orderNum || orderNumber;
    
    if (!trackingNumber || trackingNumber.trim() === '') {
      showToast('Please enter an order number', 'error');
      return;
    }

    setLoading(true);
    setOrder(null);
    setTrackingStatus(null);

    try {
      const response = await ordersAPI.track(trackingNumber);
      if (response.success) {
        setOrder(response.data);
        setTrackingStatus(response.data.status || 'pending');
        showToast('Order found!', 'success');
      } else {
        showToast(response.message || 'Order not found', 'error');
        setOrder(null);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      showToast(error.message || 'Failed to track order. Please check the order number.', 'error');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrackOrder();
  };

  const getStatusSteps = (status) => {
    const steps = [
      { id: 1, name: 'Order Placed', icon: Package, completed: true },
      { id: 2, name: 'Processing', icon: Clock, completed: status !== 'pending' },
      { id: 3, name: 'Shipped', icon: Truck, completed: ['shipped', 'delivered'].includes(status?.toLowerCase()) },
      { id: 4, name: 'Delivered', icon: CheckCircle, completed: status?.toLowerCase() === 'delivered' }
    ];
    return steps;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return statusColors[status?.toLowerCase()] || statusColors.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'Track Order', path: '/track-order' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-logo-green mb-2 font-sans uppercase tracking-wide">
            Track Your Order
          </h1>
          <p className="text-gray-600 font-sans">
            Enter your order number to track your order status
          </p>
        </div>

        {/* Track Order Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Order Number / Tracking Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter your order number"
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                    required
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-logo-green text-white font-bold py-3 px-8 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>{loading ? 'Tracking...' : 'Track Order'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Order Tracking Results */}
        {order && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-sans mb-2">
                    Order #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
                  </h2>
                  <p className="text-gray-600 font-sans">
                    Placed on {formatDate(order.createdAt || order.orderDate)}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full font-semibold text-sm font-sans ${getStatusColor(order.status)}`}>
                  {order.status || 'Pending'}
                </span>
              </div>
            </div>

            {/* Tracking Steps */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 font-sans">Order Status</h3>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-8 relative">
                  {getStatusSteps(order.status).map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.completed;
                    return (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-logo-green text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className={`text-lg font-semibold font-sans ${
                            isActive ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.name}
                          </h4>
                          {isActive && index === getStatusSteps(order.status).findIndex(s => s.completed && !getStatusSteps(order.status)[getStatusSteps(order.status).indexOf(s) + 1]?.completed) && (
                            <p className="text-sm text-gray-600 font-sans mt-1">
                              {order.status === 'delivered' ? 'Order delivered successfully!' : 'In progress...'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-6 border-t border-gray-200">
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
                    <div className="flex items-start space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                        <p>{order.shippingAddress.postalCode}</p>
                        {order.shippingAddress.phone && (
                          <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 font-sans">No address available</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
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
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
              <Link
                to={`/order-confirmation/${order._id || order.id}`}
                className="flex-1 bg-logo-green text-white font-bold py-3 px-6 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans text-center"
              >
                View Order Details
              </Link>
              <Link
                to="/"
                className="flex-1 border border-logo-green text-logo-green font-bold py-3 px-6 rounded-lg hover:bg-logo-green hover:text-white transition-colors duration-300 font-sans text-center flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* No Order Found Message */}
        {!order && !loading && orderNumber && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              Order Not Found
            </h3>
            <p className="text-gray-600 mb-8 font-sans">
              Please check your order number and try again.
            </p>
            <Link
              to="/order-history"
              className="inline-flex items-center space-x-2 bg-logo-green text-white px-6 py-3 rounded-lg hover:bg-banner-green transition-colors font-sans font-medium"
            >
              <span>View Order History</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;

