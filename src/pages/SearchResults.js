import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Search, Heart } from 'lucide-react';
import { getDisplayRating } from '../utils/ratings';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import SetPriceModal from '../components/SetPriceModal';
import Breadcrumbs from '../components/Breadcrumbs';
import { productsAPI } from '../utils/api';
import { getActiveUserRole } from '../utils/authHelper';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
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
    setSearchResults((prev) =>
      prev.map((item) =>
        (item._id || item.id) === (updatedProduct._id || updatedProduct.id) ? { ...item, ...updatedProduct } : item
      )
    );
  };

  // Get query from URL and search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    if (query) {
      setLoading(true);
      productsAPI.search(query)
        .then((response) => {
          console.log('Search response:', response);
          if (response && response.success) {
            setSearchResults(response.data || []);
          } else {
            console.warn('Search response missing success flag:', response);
            setSearchResults([]);
          }
        })
        .catch((error) => {
          console.error('Search error:', error);
          setSearchResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSearchResults([]);
    }
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Search', path: '/search' }
        ]} />

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 font-sans">Searching...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">
              Search Results for "{searchQuery}" ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => {
                const productId = product._id || product.id;
                const priceValue = typeof product.price === 'number' ? product.price : null;
                const originalValue = typeof product.originalPrice === 'number' ? product.originalPrice : null;
                const isComingSoon = Boolean(product.comingSoon) || priceValue === null;
                const isOutOfStock = Boolean(product.outOfStock) || (!product.inStock && product.stockCount === 0);
                const hasDiscount =
                  !isComingSoon && priceValue !== null && originalValue !== null && originalValue > priceValue;
                const formattedPrice = priceValue !== null ? `Rs.${priceValue.toLocaleString()}` : null;
                const formattedOriginal = originalValue !== null ? `Rs.${originalValue.toLocaleString()}` : null;
                // Priority: imageUrl (primary) > images[0] (first gallery) > image (fallback) > default
                const productImage = product.imageUrl || product.images?.[0] || product.image || '/4.webp';
                const productReviews = product.numReviews || 0;
                const displayRating = getDisplayRating(product);
                
                return (
                <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
                  <div
                    className="relative h-64 lg:h-[22rem] bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // Ensure proper image structure: imageUrl as primary, images as array with imageUrl first
                      const allImages = product.imageUrl 
                        ? [product.imageUrl, ...(product.images || []).filter(img => img && img !== product.imageUrl)]
                        : (product.images && product.images.length > 0 ? product.images : [productImage]);
                      navigate(`/product/${productId}`, { 
                        state: { 
                          product: { 
                            ...product, 
                            id: productId,
                            imageUrl: product.imageUrl || productImage,
                            images: allImages,
                            image: productImage 
                          } 
                        } 
                      });
                    }}
                  >
                    <img
                      src={productImage}
                      alt={product.name}
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
                      className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green font-sans"
                      onClick={() => {
                      // Ensure proper image structure: imageUrl as primary, images as array with imageUrl first
                      const allImages = product.imageUrl 
                        ? [product.imageUrl, ...(product.images || []).filter(img => img && img !== product.imageUrl)]
                        : (product.images && product.images.length > 0 ? product.images : [productImage]);
                      navigate(`/product/${productId}`, { 
                        state: { 
                          product: { 
                            ...product, 
                            id: productId,
                            imageUrl: product.imageUrl || productImage,
                            images: allImages,
                            image: productImage 
                          } 
                        } 
                      });
                    }}
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
                      <span className="text-sm text-gray-600 font-sans">
                        ({productReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasDiscount && formattedOriginal && (
                        <span className="text-sm text-red-600 line-through font-sans">
                          {formattedOriginal}
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-900 font-sans">
                        {formattedPrice || formattedOriginal || (isComingSoon ? 'Coming Soon' : 'Rs.0')}
                      </span>
                    </div>
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
                              addToWishlist({ ...product, id: productId, name: product.name, price: priceValue ?? 0, image: productImage });
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
                          addToCart({
                            ...product,
                            id: productId,
                            price: priceValue ?? originalValue ?? 0,
                            image: productImage,
                          });
                        }}
                        className="w-full bg-logo-green text-white py-2 px-4 rounded hover:bg-banner-green transition-colors font-sans font-medium"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </>
        ) : searchQuery ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              No products found
            </h3>
            <p className="text-gray-600 font-sans">
              Try searching for something else
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              Start searching
            </h3>
            <p className="text-gray-600 font-sans">
              Enter a product name in the search box above
            </p>
          </div>
        )}
        <SetPriceModal
          open={isPriceModalOpen}
          onClose={() => {
            setIsPriceModalOpen(false);
            setPriceProduct(null);
          }}
          product={priceProduct}
          onPriceUpdated={handlePriceUpdated}
        />
      </div>
    </div>
  );
};

export default SearchResults;
