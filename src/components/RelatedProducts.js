import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { productsAPI } from '../utils/api';
import { getDisplayRating } from '../utils/ratings';

const RelatedProducts = ({ currentProductId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await productsAPI.getRelated(currentProductId);
        if (response.success) {
          setRelatedProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        // Fallback to empty array
        setRelatedProducts([]);
      }
    };
    
    if (currentProductId) {
      fetchRelated();
    }
  }, [currentProductId]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <h2 className="text-2xl font-bold text-logo-green mb-8 font-sans">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const productId = product._id || product.id;
          const priceValue = typeof product.price === 'number'
            ? product.price
            : (typeof product.originalPrice === 'number' ? product.originalPrice : null);
          const productPrice = priceValue !== null ? `Rs.${priceValue.toLocaleString()}` : 'Price not available';
          // Priority: imageUrl (primary) > images[0] (first gallery) > image (fallback) > default
          const productImage = product.imageUrl || product.images?.[0] || product.image || '/4.webp';
          const isComingSoon = Boolean(product.comingSoon) || priceValue === null;
          const isOutOfStock = Boolean(product.outOfStock) || (!product.inStock && product.stockCount === 0);
          const productReviews = product.numReviews || 0;
          const displayRating = getDisplayRating(product);
          
          return (
          <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div
              className="h-48 bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, image: productImage } } })}
            >
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-contain lg:object-cover p-4"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3
                className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green transition-colors font-sans text-sm"
                onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, image: productImage } } })}
              >
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i + 1 <= displayRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-sans">({productReviews} reviews)</span>
              </div>
              <div className="text-lg font-bold text-logo-green font-sans">{productPrice}</div>
              {isComingSoon || isOutOfStock ? (
                // Show "Add to Wishlist" only for users, not for admin
                !isAdminAuthenticated ? (
                  <button
                    onClick={() => {
                      if (isInWishlist(productId)) {
                        removeFromWishlist(productId);
                        showToast('Removed from wishlist', 'success');
                      } else {
                        addToWishlist({ ...product, id: productId, price: priceValue ?? 0, image: productImage });
                        showToast('Added to wishlist!', 'success');
                      }
                    }}
                    className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white flex items-center justify-center gap-2 font-sans"
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(productId) ? 'text-red-500 fill-current' : ''}`} />
                    {isInWishlist(productId) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                ) : null // Admin users don't see "Add to Wishlist" - they manage via admin panel
              ) : (
                <button
                  onClick={() => {
                    if (priceValue === null) {
                      showToast('Price not available yet for this product.', 'info');
                      return;
                    }
                    addToCart({ ...product, id: productId, price: priceValue, image: productImage });
                  }}
                  className="w-full bg-logo-green text-white py-2 px-4 rounded hover:bg-banner-green transition-colors font-sans font-medium text-sm"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;
