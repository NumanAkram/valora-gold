import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import SetPriceModal from './SetPriceModal';
import { productsAPI } from '../utils/api';
import { getDisplayRating } from '../utils/ratings';
import { getActiveUserRole } from '../utils/authHelper';

const RelatedProducts = ({ currentProductId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [priceProduct, setPriceProduct] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  // Check user role from localStorage
  const syncUserRole = useCallback(() => {
    try {
      const authInfo = getActiveUserRole();
      setUserRole(authInfo.role);
    } catch (error) {
      console.error('Failed to determine user role', error);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    syncUserRole();

    const handleStorage = (event) => {
      if (
        event.key === 'user' ||
        event.key === 'valora_admin' ||
        event.key === 'token' ||
        event.key === 'admin_token' ||
        event.key === null
      ) {
        syncUserRole();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('valora-user-updated', syncUserRole);
    window.addEventListener('admin-auth-changed', syncUserRole);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('valora-user-updated', syncUserRole);
      window.removeEventListener('admin-auth-changed', syncUserRole);
    };
  }, [syncUserRole]);

  // Check if user is admin (either through admin login or regular login with admin role)
  const isAdmin = isAdminAuthenticated || (userRole && userRole.toLowerCase() === 'admin');

  const openPriceModal = (product) => {
    setPriceProduct(product);
    setIsPriceModalOpen(true);
  };

  const handlePriceUpdated = (updatedProduct) => {
    setRelatedProducts((prev) =>
      prev.map((item) =>
        (item._id || item.id) === (updatedProduct._id || updatedProduct.id) ? { ...item, ...updatedProduct } : item
      )
    );
  };

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
          <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
            <div
              className="relative h-48 lg:h-[22rem] bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, image: productImage } } })}
            >
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-contain lg:object-cover"
              />
              
              {/* Coming Soon Badge */}
              {isComingSoon && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-500 text-white shadow-lg uppercase">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Out of Stock Badge - Show if out of stock but not coming soon */}
              {!isComingSoon && isOutOfStock && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-500 text-white shadow-lg uppercase">
                    Out of Stock
                  </span>
                </div>
              )}
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
                // Admin: Show "Set Price" only for Coming Soon, nothing for Out of Stock
                // Users: Show "Add to Wishlist" for both Coming Soon and Out of Stock
                isAdmin && isComingSoon ? (
                  <button
                    onClick={() => openPriceModal(product)}
                    className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white font-sans"
                  >
                    Set Price
                  </button>
                ) : !isAdmin ? (
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
                ) : null // Admin + Out of Stock = no button
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
      <SetPriceModal
        open={isPriceModalOpen}
        onClose={() => {
          setIsPriceModalOpen(false);
          setPriceProduct(null);
        }}
        product={priceProduct}
        onPriceUpdated={handlePriceUpdated}
      />
    </section>
  );
};

export default RelatedProducts;
