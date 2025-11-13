import React from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart, parsePrice } from '../context/CartContext';

const formatCurrency = (value) => {
  if (!Number.isFinite(value)) {
    return 'Rs.0';
  }
  return `Rs.${value.toLocaleString()}`;
};

const CartSidebar = () => {
  const {
    cartItems,
    isSidebarOpen,
    closeCartSidebar,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    lastAddedItemId,
  } = useCart();

  const navigate = useNavigate();

  const subtotal = getCartTotal();

  const handleCheckout = () => {
    closeCartSidebar();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCartSidebar();
    navigate('/cart');
  };

  return (
    <div
      className={`fixed inset-0 z-[998] flex justify-end transition-opacity duration-300 ${
        isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isSidebarOpen ? 1 : 0 }}
        onClick={closeCartSidebar}
        aria-hidden="true"
      />
      <aside
        className={`relative w-full max-w-sm sm:max-w-md md:max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-500 mt-1">
              {cartItems.length} item{cartItems.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCartSidebar}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close cart sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Your cart is empty</h3>
              <p className="text-sm text-gray-500">
                Browse our products and add items to your cart to see them here.
              </p>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemPrice = parsePrice(item.price || item.salePrice || 0);
              const itemSubtotal = itemPrice * item.quantity;
              const isNewlyAdded = lastAddedItemId && lastAddedItemId === item.id;

              const imageSrc = item.images?.[0] || item.image || '/4.webp';

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-transform duration-200 ${
                    isNewlyAdded ? 'ring-2 ring-logo-green/40' : ''
                  }`}
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={imageSrc}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        <div className="mt-1 text-sm">
                          {item.originalPrice && item.originalPrice > itemPrice ? (
                            <div className="space-x-2">
                              <span className="text-gray-400 line-through">
                                {formatCurrency(parsePrice(item.originalPrice))}
                              </span>
                              <span className="text-logo-green font-semibold">
                                {formatCurrency(itemPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-logo-green font-semibold">
                              {formatCurrency(itemPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-logo-green transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-logo-green transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <footer className="border-t border-gray-200 px-6 py-5 space-y-4">
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Subtotal:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Tax included and shipping calculated at checkout.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-full bg-gray-900 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0}
            >
              Checkout
            </button>
            <button
              type="button"
              onClick={handleViewCart}
              className="w-full rounded-full border border-gray-300 py-3 text-sm font-semibold uppercase tracking-wide text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0}
            >
              View Cart
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
};

export default CartSidebar;

