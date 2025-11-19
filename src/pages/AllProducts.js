import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { productsAPI } from '../utils/api';
import { getDisplayRating } from '../utils/ratings';
import SetPriceModal from '../components/SetPriceModal';
import { getActiveUserRole } from '../utils/authHelper';

const AllProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceProduct, setPriceProduct] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products without category filter
        const response = await productsAPI.getAll({ 
          limit: 1000, // Fetch all products
          sort: 'newest' 
        });
        console.log('All Products API Response:', response);
        if (response && response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
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
      if (!newProduct) return;

      setProducts((prev) => {
        const exists = prev.some(
          (item) => (item._id || item.id)?.toString() === (newProduct._id || newProduct.id)?.toString()
        );
        if (exists) {
          return prev.map((item) =>
            (item._id || item.id)?.toString() === (newProduct._id || newProduct.id)?.toString()
              ? { ...item, ...newProduct }
              : item
          );
        }
        return [...prev, newProduct];
      });
    };

    window.addEventListener('product-added', handleProductAdded);
    return () => window.removeEventListener('product-added', handleProductAdded);
  }, []);

  const openPriceModal = (product) => {
    setPriceProduct(product);
    setIsPriceModalOpen(true);
  };

  const handlePriceUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((item) =>
        (item._id || item.id) === (updatedProduct._id || updatedProduct.id) ? { ...item, ...updatedProduct } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'All Products', path: '/all-products' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-logo-green mb-2 font-sans uppercase tracking-wide">
            All Products
          </h1>
          <p className="text-gray-600 font-sans">
            Browse our complete collection of premium products
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 font-sans">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600 font-sans">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const productId = product._id || product.id;
                const productName = product.name || product.title || '';
                const productPrice = typeof product.price === 'number' ? product.price : null;
                const productOriginalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : null;
                // Priority: imageUrl (primary) > images[0] (first gallery) > image (fallback) > default
                const productImage = product.imageUrl || product.images?.[0] || product.image || '/4.webp';
                // Gallery images: all images except the primary imageUrl
                const galleryImages = product.imageUrl 
                  ? (product.images || []).filter(img => img !== product.imageUrl)
                  : (product.images || []).slice(1);
                const productRating = getDisplayRating(product);
                const productReviews = product.numReviews || 0;
                const isComingSoon = Boolean(product.comingSoon) || productPrice === null;
                const isOutOfStock = Boolean(product.outOfStock) || (!product.inStock && product.stockCount === 0);
                const hasSale = !isComingSoon && productOriginalPrice !== null && productPrice !== null && productOriginalPrice > productPrice;
                // For this specific product, show 60% off tag when applicable
                const salePercent = !isComingSoon && hasSale
                  ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
                  : 0;

                return (
                  <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
                    {/* Sale Badge */}
                    {!isComingSoon && hasSale && salePercent > 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-logo-green text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Sale {salePercent}%
                        </div>
                      </div>
                    )}

                    {/* Wishlist Button - Only for users, not admin */}
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          if (isInWishlist(productId)) {
                            removeFromWishlist(productId);
                            showToast('Removed from wishlist', 'success');
                          } else {
                            addToWishlist({ ...product, id: productId, name: productName, price: productPrice ?? 0, image: productImage });
                            showToast('Added to wishlist!', 'success');
                          }
                        }}
                        className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Heart className={`h-5 w-5 ${isInWishlist(productId) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                      </button>
                    )}

                    {/* Product Image */}
                    <div
                      className="relative h-64 bg-gray-50 cursor-pointer"
                      onClick={() => {
                        // Ensure proper image structure: imageUrl as primary, images as array with imageUrl first
                        const allImages = product.imageUrl 
                          ? [product.imageUrl, ...(product.images || []).filter(img => img !== product.imageUrl)]
                          : (product.images || product.image ? [productImage, ...(product.images || []).slice(1)] : [productImage]);
                        navigate(`/product/${productId}`, { 
                          state: { 
                            product: { 
                              ...product, 
                              id: productId, 
                              _id: productId, 
                              name: productName, 
                              title: productName, 
                              price: productPrice, 
                              originalPrice: productOriginalPrice,
                              imageUrl: product.imageUrl || productImage,
                              images: allImages,
                              image: productImage, 
                              rating: productRating, 
                              numReviews: productReviews 
                            } 
                          } 
                        });
                      }}
                    >
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-contain lg:object-cover p-4"
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

                    {/* Product Details */}
                    <div className="p-4 space-y-3 font-sans">
                      {/* Product Title */}
                      <h3
                        className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green transition-colors line-clamp-2"
                        onClick={() => {
                        // Ensure proper image structure: imageUrl as primary, images as array with imageUrl first
                        const allImages = product.imageUrl 
                          ? [product.imageUrl, ...(product.images || []).filter(img => img !== product.imageUrl)]
                          : (product.images || product.image ? [productImage, ...(product.images || []).slice(1)] : [productImage]);
                        navigate(`/product/${productId}`, { 
                          state: { 
                            product: { 
                              ...product, 
                              id: productId, 
                              _id: productId, 
                              name: productName, 
                              title: productName, 
                              price: productPrice, 
                              originalPrice: productOriginalPrice,
                              imageUrl: product.imageUrl || productImage,
                              images: allImages,
                              image: productImage, 
                              rating: productRating, 
                              numReviews: productReviews 
                            } 
                          } 
                        });
                      }}
                      >
                        {productName}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i + 1 <= productRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({productReviews} reviews)
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center space-x-2">
                        {isComingSoon ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 uppercase">
                            <Tag className="h-3 w-3" />
                            Coming Soon
                          </span>
                        ) : (
                          <>
                            {hasSale && (
                              <span className="text-sm text-red-600 line-through">
                                Rs.{productOriginalPrice?.toLocaleString()}
                              </span>
                            )}
                            <span className="text-lg font-bold text-gray-900">
                              Rs.{(productPrice ?? productOriginalPrice ?? 0).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action Button */}
                      {isComingSoon || isOutOfStock ? (
                        // Admin: Show "Set Price" only for Coming Soon, nothing for Out of Stock
                        // Users: Show "Add to Wishlist" for both Coming Soon and Out of Stock
                        isAdmin && isComingSoon ? (
                          <button
                            onClick={() => openPriceModal(product)}
                            className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white"
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
                                addToWishlist({ ...product, id: productId, name: productName, price: productPrice ?? 0, image: productImage });
                                showToast('Added to wishlist!', 'success');
                              }
                            }}
                            className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white flex items-center justify-center gap-2"
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
                              name: productName,
                              price: productPrice,
                              image: productImage
                            });
                          }}
                          className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white"
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
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              No products found
            </h3>
            <p className="text-gray-600 font-sans">
              There are currently no products available.
            </p>
          </div>
        )}
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
    </div>
  );
};

export default AllProducts;

