import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CreditCard, Truck, Lock, ChevronDown, ClipboardList } from 'lucide-react';
import { useCart, parsePrice } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI, authAPI } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const location = useLocation();
  const buyNowProduct = location.state?.buyNowProduct;

  const displayItems = buyNowProduct
    ? [{ ...buyNowProduct, quantity: buyNowProduct.quantity || 1 }]
    : cartItems;

  const computeSubtotal = () => {
    if (buyNowProduct) {
      const priceValue = parsePrice(buyNowProduct.price);
      const qty = buyNowProduct.quantity || 1;
      return priceValue * qty;
    }
    return getCartTotal();
  };
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    // Shipping Address
    street: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    // Payment
    paymentMethod: 'COD',
    // Notes
    notes: ''
  });

  useEffect(() => {
    // Try to get user info if logged in
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(response => {
          if (response.success) {
            setUser(response.data);
            // Pre-fill form with user data
            if (response.data.addresses && response.data.addresses.length > 0) {
              const defaultAddress = response.data.addresses.find(addr => addr.isDefault) || response.data.addresses[0];
              setFormData(prev => ({
                ...prev,
                street: defaultAddress.street || '',
                city: defaultAddress.city || '',
                province: defaultAddress.province || '',
                postalCode: defaultAddress.postalCode || '',
                phone: defaultAddress.phone || response.data.phone || '',
              }));
            } else if (response.data.phone) {
              setFormData(prev => ({
                ...prev,
                phone: response.data.phone
              }));
            }
          }
        })
        .catch(() => {
          // User not logged in or token invalid
        });
    }
  }, []);

  if (!buyNowProduct && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-sans">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8 font-sans">Add some products to your cart to checkout</p>
            <button
              onClick={() => navigate('/')}
              className="bg-logo-green text-white px-6 py-3 rounded-lg hover:bg-banner-green transition-colors font-sans font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.street || !formData.city || !formData.province || !formData.phone) {
      showToast('Please fill in all required shipping fields', 'error');
      return;
    }

    if (!formData.postalCode) {
      showToast('Please enter postal code', 'error');
      return;
    }

    setLoading(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please sign in to place an order', 'error');
        navigate('/signin');
        return;
      }

      // Prepare order data
      const orderData = {
        items: displayItems.map((item) => ({
          productId: item._id || item.id,
          slug: item.slug,
          name: item.name || item.title,
          quantity: item.quantity || 1,
        })),
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      // Create order
      const response = await ordersAPI.create(orderData);
      
      if (response.success) {
        showToast('Order placed successfully!', 'success');
        if (!buyNowProduct) {
          clearCart();
        }
        
        // Redirect to order confirmation
        setTimeout(() => {
          navigate(`/order-confirmation/${response.data._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToast(error.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = computeSubtotal();
  const shipping = 0; // Free shipping
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Cart', path: '/cart' },
          { label: 'Checkout', path: '/checkout' }
        ]} />

        <h1 className="text-2xl sm:text-3xl font-bold text-logo-green mb-4 sm:mb-6 md:mb-8 font-sans">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 md:p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="h-5 w-5 text-logo-green" />
                  <h2 className="text-xl font-bold text-gray-900 font-sans">Shipping Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                      placeholder="House number, street name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                        placeholder="Punjab, Sindh, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                        placeholder="0339-0005256"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="h-5 w-5 text-logo-green" />
                  <h2 className="text-xl font-bold text-gray-900 font-sans">Payment Method</h2>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border-2 border-logo-green rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="text-logo-green focus:ring-logo-green"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 font-sans">Cash on Delivery</div>
                      <div className="text-sm text-gray-600 font-sans">Pay when you receive your order</div>
                    </div>
                    <Truck className="h-5 w-5 text-logo-green" />
                  </label>

                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-logo-green">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Bank Transfer"
                      checked={formData.paymentMethod === 'Bank Transfer'}
                      onChange={handleChange}
                      className="text-logo-green focus:ring-logo-green"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 font-sans flex items-center gap-2">
                        Online Payment (Manual)
                        <ChevronDown
                          className={`h-4 w-4 text-logo-green transition-transform ${formData.paymentMethod === 'Bank Transfer' ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <div className="text-sm text-gray-600 font-sans">Pay via bank transfer or Easypaisa using manual confirmation</div>
                    </div>
                    <ClipboardList className="h-5 w-5 text-logo-green" />
                  </label>

                  {formData.paymentMethod === 'Bank Transfer' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-white border border-logo-green/40 rounded-xl p-4 sm:p-5 shadow-sm">
                        <h3 className="text-sm sm:text-base font-semibold text-logo-green uppercase tracking-wide font-sans">
                          Bank of Punjab Manual Payment Details
                        </h3>
                        <ul className="mt-3 space-y-1 text-sm text-gray-700 font-sans">
                          <li><span className="font-semibold">IBAN:</span> PK56BPUN5010028428800018</li>
                          <li><span className="font-semibold">Account Number:</span> 5010028428800018</li>
                          <li><span className="font-semibold">Account Title:</span> ZAHID IQBAL</li>
                        </ul>
                        <p className="mt-4 text-sm sm:text-base text-gray-700 font-sans leading-relaxed">
                          After sending the payment, share the screenshot of the successful payment on
                          <a href="tel:03390005256" className="ml-1 text-logo-green font-semibold text-base sm:text-lg underline">
                            0339-0005256
                          </a>.
                          <span className="block mt-1">Once approved, your order will be placed and you will be notified.</span>
                        </p>
                      </div>

                      <div className="bg-white border border-logo-green/40 rounded-xl p-4 sm:p-5 shadow-sm">
                        <h3 className="text-sm sm:text-base font-semibold text-logo-green uppercase tracking-wide font-sans">
                          Easypaisa Manual Payment Details
                        </h3>
                        <ul className="mt-3 space-y-1 text-sm text-gray-700 font-sans">
                          <li><span className="font-semibold">IBAN:</span> PK96TMFB0000000016006034</li>
                          <li><span className="font-semibold">Account Number:</span> 03483582165</li>
                          <li><span className="font-semibold">Account Title:</span> ZAHID IQBAL</li>
                        </ul>
                        <p className="mt-4 text-sm sm:text-base text-gray-700 font-sans leading-relaxed">
                          After sending the payment, share the screenshot of the successful payment on
                          <a href="tel:03390005256" className="ml-1 text-logo-green font-semibold text-base sm:text-lg underline">
                            0339-0005256
                          </a>.
                          <span className="block mt-1">Once approved, your order will be placed and you will be notified.</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
                  placeholder="Special instructions for delivery..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="flex items-center space-x-2 mb-6">
                  <Lock className="h-5 w-5 text-logo-green" />
                  <h2 className="text-xl font-bold text-gray-900 font-sans">Order Summary</h2>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {displayItems.map((item) => {
                    const itemPrice = parsePrice(item.price || item.salePrice || item.originalPrice || 0);
                    const itemTotal = itemPrice * (item.quantity || 1);
                    return (
                      <div key={item._id || item.id} className="flex items-center space-x-3 pb-3 border-b">
                        <img
                          src={item.images?.[0] || item.image || '/4.png'}
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 font-sans">{item.name}</div>
                          <div className="text-sm text-gray-600 font-sans">
                            Qty: {item.quantity} × Rs.{itemPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="font-semibold text-logo-green font-sans">
                          Rs.{(itemPrice * (item.quantity || 1)).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="space-y-3 border-t pt-4 mb-6">
                  <div className="flex justify-between text-gray-700 font-sans">
                    <span>Subtotal:</span>
                    <span>Rs.{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 font-sans">
                    <span>Shipping:</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-sans">
                      <span>Discount:</span>
                      <span>-Rs.{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-logo-green border-t pt-3 font-sans">
                    <span>Total:</span>
                    <span>Rs.{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-logo-green text-white font-bold py-4 px-6 rounded-lg hover:bg-banner-green transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center font-sans">
                  🔒 Your payment information is secure
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;