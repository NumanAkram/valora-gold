import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { getDisplayRating } from '../utils/ratings';
import { useAdminAuth } from '../context/AdminAuthContext';
import { productsAPI } from '../utils/api';
import { getActiveUserRole } from '../utils/authHelper';

const MAX_PRODUCTS = 4;
const ADD_PRODUCT_BUTTON_ID = 'add-product-button';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({ limit: MAX_PRODUCTS + 10, sort: 'newest' });
        if (response.success && Array.isArray(response.data)) {
          const filtered = response.data
            .filter((item) => item && item.category && item.category.toLowerCase() !== 'other')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setProducts(filtered.slice(0, MAX_PRODUCTS));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    const handleProductAdded = (event) => {
      const newProduct = event.detail;
      if (!newProduct || !newProduct.category || newProduct.category.toLowerCase() === 'other') {
        return;
      }

      setProducts((prev) => {
        const existingIndex = prev.findIndex(
          (item) => (item._id || item.id)?.toString() === (newProduct._id || newProduct.id)?.toString()
        );

        const updated = existingIndex >= 0
          ? prev.map((item, index) => (index === existingIndex ? { ...item, ...newProduct } : item))
          : [{ ...newProduct }, ...prev];

        const sorted = updated
          .filter(Boolean)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return sorted.slice(0, MAX_PRODUCTS);
      });
    };

    window.addEventListener('product-added', handleProductAdded);
    return () => window.removeEventListener('product-added', handleProductAdded);
  }, []);

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

  const canManageProducts = Boolean(
    isAdminAuthenticated || (userRole && userRole.toLowerCase() === 'admin')
  );

  const handleAddProductClick = useCallback(() => {
    const openEvent = new CustomEvent('admin-add-product-open');
    window.dispatchEvent(openEvent);
  }, []);

  const displayProducts = products;

  if (loading) {
    return (
      <section className="bg-white py-12 w-full">
        <div className="w-full px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-logo-green text-center mb-12 uppercase tracking-wide font-sans">
            OUR BEST SELLERS
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-600 font-sans">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  const hasProducts = displayProducts.length > 0;

  return (
    <section className="bg-white py-6 sm:py-8 md:py-12 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-logo-green text-center mb-6 sm:mb-8 md:mb-12 uppercase tracking-wide font-sans">
          OUR BEST SELLERS
        </h2>

        {canManageProducts && (
          <div className="flex justify-center mb-6">
            <button
              id={ADD_PRODUCT_BUTTON_ID}
              onClick={handleAddProductClick}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-logo-green text-logo-green font-semibold hover:bg-logo-green hover:text-white transition-colors"
            >
              <span className="text-xl leading-none">+</span>
              Add Product
            </button>
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Products Grid */}
          {hasProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product) => {
              // Format product data for display
              const productId = product._id || product.id;
              const productSlug = product.slug || (productId ? String(productId).toLowerCase() : null);
              const productName = product.name;
              const formatCurrency = (value) => {
                if (value === undefined || value === null) {
                  return null;
                }
                if (typeof value === 'number') {
                  return `Rs.${value.toLocaleString()}`;
                }
                if (typeof value === 'string') {
                  const normalized = value.trim();
                  return normalized.startsWith('Rs.') ? normalized : `Rs.${normalized}`;
                }
                return null;
              };

              const formattedPrice = formatCurrency(product.price);
              const formattedOriginal = formatCurrency(product.originalPrice);
              const hasDiscount =
                formattedPrice && formattedOriginal && formattedPrice !== formattedOriginal;
              // Priority: imageUrl (primary) > images[0] (first gallery) > image (fallback) > default
              const productImage = product.imageUrl || product.images?.[0] || product.image || '/4.webp';
              const ratingValue = getDisplayRating(product);
              const productReviews = typeof product.numReviews === 'number'
                ? product.numReviews
                : Array.isArray(product.reviews)
                  ? product.reviews.length
                  : 0;

              const getNumericPrice = (value) => {
                if (value === undefined || value === null) {
                  return null;
                }
                if (typeof value === 'number') {
                  return value;
                }
                if (typeof value === 'string') {
                  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
                  return Number.isNaN(numeric) ? null : numeric;
                }
                return null;
              };

              const priceForCart = getNumericPrice(product.price) ?? getNumericPrice(product.originalPrice) ?? 0;
              const productPrice = getNumericPrice(product.price);
              const productOriginalPrice = getNumericPrice(product.originalPrice);
              const isComingSoon = Boolean(product.comingSoon) || productPrice === null;
              const isOutOfStock = Boolean(product.outOfStock) || (!product.inStock && product.stockCount === 0);
              const hasSale = !isComingSoon && productPrice !== null && productOriginalPrice !== null && productOriginalPrice > productPrice;
              const salePercent = hasSale ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100) : 0;
              
              return (
              <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
                 {/* Product Image - Clickable */}
                 <div 
                  className="relative h-64 lg:h-[22rem] bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId } } })}
                 >
                   <img
                     src={productImage}
                     alt={productName}
                     className="w-full h-full object-contain lg:object-cover"
                   />

                   {/* Coming Soon Badge - Priority */}
                   {isComingSoon && (
                     <div className="absolute top-2 left-2 z-10">
                       <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-500 text-white shadow-lg uppercase">
                         Coming Soon
                       </span>
                     </div>
                   )}

                   {/* Out of Stock Badge - Priority after Coming Soon */}
                   {!isComingSoon && isOutOfStock && (
                     <div className="absolute top-2 left-2 z-10">
                       <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-500 text-white shadow-lg uppercase">
                         Out of Stock
                       </span>
                     </div>
                   )}

                   {/* Sale Badge - Only show if not coming soon and not out of stock */}
                   {!isComingSoon && !isOutOfStock && hasSale && salePercent > 0 && (
                     <div className="absolute top-2 left-2 z-10">
                       <div className="bg-logo-green text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                         Sale {salePercent}%
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Wishlist Button - Only for users, not admin */}
                 {!canManageProducts && (
                   <button
                     onClick={() => {
                       if (isInWishlist(productId)) {
                         removeFromWishlist(productId);
                         showToast('Removed from wishlist', 'success');
                       } else {
                         addToWishlist({ ...product, id: productId, image: productImage });
                         showToast('Added to wishlist!', 'success');
                       }
                     }}
                     className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                   >
                     <Heart className={`h-5 w-5 ${isInWishlist(productId) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                   </button>
                 )}

                 {/* Product Details */}
                 <div className="p-4 space-y-3 font-sans">
                   {/* Product Name - Clickable */}
                   <h3 
                     className="text-sm font-medium text-gray-800 leading-tight h-10 overflow-hidden cursor-pointer hover:text-logo-green transition-colors"
                    onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId } } })}
                   >
                     {productName}
                   </h3>

                   {/* Rating */}
                   <div className="flex items-center space-x-2">
                     <div className="flex">
                       {[...Array(5)].map((_, i) => (
                         <Star
                           key={i}
                           className={`h-4 w-4 ${i + 1 <= ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                         />
                       ))}
                     </div>
                     <span className="text-xs text-gray-600">{productReviews} reviews</span>
                   </div>

                   {/* Price */}
                   <div className="flex items-center space-x-2">
                     {isComingSoon ? (
                       <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 uppercase">
                         Coming Soon
                       </span>
                     ) : isOutOfStock ? (
                       <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 uppercase">
                         Out of Stock
                       </span>
                     ) : (
                       <>
                         {hasDiscount && formattedOriginal && (
                           <span className="text-sm text-red-600 line-through">
                             {formattedOriginal}
                           </span>
                         )}
                         <span className="text-base font-bold text-gray-900">
                           {formattedPrice || formattedOriginal || 'Rs.0'}
                         </span>
                       </>
                     )}
                   </div>

                  {/* Action Button */}
                  {isComingSoon || isOutOfStock ? (
                    // Show "Add to Wishlist" only for users, not for admin
                    !canManageProducts ? (
                      <button 
                        onClick={() => {
                          if (isInWishlist(productId)) {
                            removeFromWishlist(productId);
                            showToast('Removed from wishlist', 'success');
                          } else {
                            addToWishlist({ ...product, id: productId, name: productName, price: priceForCart, image: productImage });
                            showToast('Added to wishlist!', 'success');
                          }
                        }}
                        className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase hover:bg-logo-green hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(productId) ? 'text-red-500 fill-current' : ''}`} />
                        {isInWishlist(productId) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      </button>
                    ) : null // Admin users don't see "Add to Wishlist" - they manage via admin panel
                  ) : (
                    <button 
                      onClick={() => {
                        addToCart({
                          ...product,
                          id: productId,
                          _id: product._id || productId,
                          slug: productSlug || product.slug,
                          price: priceForCart,
                          image: productImage,
                        });
                      }}
                      className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase hover:bg-logo-green hover:text-white transition-colors duration-300"
                    >
                      ADD TO CART
                    </button>
                  )}
                 </div>
              </div>
             );
           })}
           </div>
          ) : (
            <div className="py-10 text-center text-gray-500 font-sans">
              No best sellers available yet. Please check back soon.
            </div>
          )}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <button
            onClick={() => navigate('/all-products')}
            className="bg-logo-green text-white font-bold py-3 px-8 rounded-lg text-sm uppercase hover:bg-banner-green transition-colors duration-300 font-sans"
          >
            View More
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
