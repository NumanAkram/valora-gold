import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import { ordersAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Breadcrumbs from '../components/Breadcrumbs';

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(id);
        if (response.success) {
          setOrder(response.data);
        } else {
          showToast('Order not found', 'error');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        showToast('Error loading order', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 font-sans">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'Order Confirmation', path: `/orders/${id}` }
        ]} />

        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-sans">
            Order Placed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-8 font-sans">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 font-sans">Order Number</h3>
                <p className="text-logo-green font-bold font-sans">{order.orderNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 font-sans">Order Date</h3>
                <p className="text-gray-700 font-sans">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 font-sans">Payment Method</h3>
                <p className="text-gray-700 font-sans">{order.paymentMethod}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 font-sans">Order Status</h3>
                <p className="text-gray-700 font-sans capitalize">{order.orderStatus}</p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 font-sans">Shipping Address</h3>
                <p className="text-gray-700 font-sans">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}<br />
                  {order.shippingAddress.postalCode}<br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 font-sans">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-gray-700 font-sans">
                    <span>{item.name} × {item.quantity}</span>
                    <span>Rs.{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold text-logo-green font-sans">
                  <span>Total:</span>
                  <span>Rs.{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-2 bg-logo-green text-white px-6 py-3 rounded-lg hover:bg-banner-green transition-colors font-sans font-medium"
            >
              <Home className="h-5 w-5" />
              <span>Continue Shopping</span>
            </Link>
            
            {order.trackingNumber && (
              <div className="inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-sans font-medium">
                <Package className="h-5 w-5" />
                <span>Track Order: {order.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
