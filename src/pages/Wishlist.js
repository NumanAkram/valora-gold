import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Breadcrumbs from '../components/Breadcrumbs';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
    showToast('Removed from wishlist', 'success');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Wishlist', path: '/wishlist' }]} />
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-sans">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8 font-sans">Start adding products to your wishlist!</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-logo-green text-white px-6 py-3 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Wishlist', path: '/wishlist' }]} />
        <h1 className="text-3xl font-bold text-logo-green mb-8 font-sans">My Wishlist ({wishlistItems.length})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            // Check if product is coming soon (no price or comingSoon flag)
            const isComingSoon = item.comingSoon === true || 
                                item.price === null || 
                                item.price === undefined ||
                                (typeof item.price === 'number' && item.price <= 0);
            
            // Check if product is out of stock
            const isOutOfStock = item.inStock === false || 
                                (item.stockCount !== undefined && item.stockCount === 0 && item.inStock !== true);
            
            const productPrice = item.price || item.salePrice || item.originalPrice || 0;
            
            // Get the primary image
            const productImage = item.imageUrl || item.image || (item.images && item.images[0]) || '/4.webp';

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                </button>

                {/* Status Badge */}
                {(isComingSoon || isOutOfStock) && (
                  <div className="absolute top-2 left-2 z-10">
                    {isComingSoon && (
                      <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full font-sans">
                        Coming Soon
                      </span>
                    )}
                    {!isComingSoon && isOutOfStock && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full font-sans">
                        Out of Stock
                      </span>
                    )}
                  </div>
                )}
                
                <div
                  className="h-64 lg:h-[22rem] bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`, { state: { product: { ...item, id: item.id, images: item.images || [productImage], image: productImage, imageUrl: productImage } } })}
                >
                  <img
                    src={productImage}
                    alt={item.name || item.title}
                    className="w-full h-full object-contain lg:object-cover"
                    onError={(e) => {
                      e.target.src = '/4.webp';
                    }}
                  />
                </div>

                <div className="p-4 space-y-3">
                  <h3
                    className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green transition-colors font-sans"
                    onClick={() => navigate(`/product/${item.id}`, { state: { product: { ...item, id: item.id, images: item.images || [item.image || '/4.webp'], image: item.image || '/4.webp' } } })}
                  >
                    {item.name || item.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {item.originalPrice && item.price && item.originalPrice > item.price && !isComingSoon && (
                      <span className="text-sm text-red-600 line-through font-sans">
                        Rs.{Number(item.originalPrice).toLocaleString()}
                      </span>
                    )}
                    <span className="text-lg font-bold text-gray-900 font-sans">
                      {isComingSoon ? 'Price TBA' : `Rs.${Number(productPrice).toLocaleString()}`}
                    </span>
                  </div>
                  <button
                    onClick={() => !isComingSoon && !isOutOfStock && handleAddToCart(item)}
                    disabled={isComingSoon || isOutOfStock}
                    className={`w-full py-2 px-4 rounded transition-colors font-sans font-medium flex items-center justify-center space-x-2 ${
                      isComingSoon || isOutOfStock
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-logo-green text-white hover:bg-banner-green'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>
                      {isComingSoon ? 'Coming Soon' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
