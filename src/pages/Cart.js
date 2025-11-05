import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }
    navigate('/checkout');
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
    showToast('Item removed from cart', 'success');
  };

  const handleClearCart = () => {
    clearCart();
    showToast('Cart cleared', 'success');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-sans">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8 font-sans">Start adding products to your cart!</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-logo-green text-white px-6 py-3 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-logo-green mb-4 sm:mb-6 md:mb-8 font-sans">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const itemPrice = parseFloat((item.price || item.salePrice || '0').replace(/[^0-9.]/g, ''));
              const itemTotal = itemPrice * item.quantity;

              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || "/4.png"}
                      alt={item.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg p-2"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 font-sans text-sm sm:text-base">
                      {item.name || item.title}
                    </h3>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-lg font-bold text-logo-green font-sans">
                        {item.salePrice || item.price}
                      </span>
                      {item.originalPrice && item.salePrice && (
                        <span className="text-sm text-gray-500 line-through ml-2 font-sans">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 font-sans">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold font-sans">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item)}
                        className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4">
                      <span className="text-lg font-bold text-gray-900 font-sans">
                        Total: Rs.{itemTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 font-medium font-sans"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-sans">Subtotal:</span>
                  <span className="font-semibold font-sans">Rs.{getCartTotal().toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-sans">Shipping:</span>
                  <span className="font-semibold font-sans">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 font-sans">Total:</span>
                    <span className="text-lg font-bold text-logo-green font-sans">
                      Rs.{getCartTotal().toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-logo-green text-white font-bold py-3 px-6 rounded-lg uppercase hover:bg-banner-green transition-colors duration-300 font-sans"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center mt-4 text-logo-green hover:underline font-sans"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
