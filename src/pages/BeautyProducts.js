import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { productsAPI } from '../utils/api';
import { getDisplayRating } from '../utils/ratings';
import SetPriceModal from '../components/SetPriceModal';

const BeautyProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceProduct, setPriceProduct] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll({ limit: 100, category: 'Beauty' });

        if (response && response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching beauty & skin care products:', error);
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
      if (!newProduct || newProduct.category !== 'Beauty') return;

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
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Beauty & Skin Care', path: '/beauty-products' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-logo-green mb-2 font-sans uppercase tracking-wide">
            Beauty & Skin Care
          </h1>
          <p className="text-gray-600 font-sans">
            Reveal your natural glow with luxurious skincare crafted by Valora Gold
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
                const productImage = product.images?.[0] || product.image || '/4.png';
                const productRating = getDisplayRating(product);
                const productReviews = product.numReviews || 0;
                const isComingSoon = Boolean(product.comingSoon) || productPrice === null;
                const hasSale = !isComingSoon && productOriginalPrice !== null && productPrice !== null && productOriginalPrice > productPrice;
                const salePercent = !isComingSoon
                  ? (hasSale ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100) : 0)
                  : 0;

                return (
                  <div
                    key={productId}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative"
                  >
                    {hasSale && salePercent > 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-logo-green text-white text-xs font-bold px-2 py-1 rounded-full">
                          Sale {salePercent}%
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (isInWishlist(productId)) {
                          removeFromWishlist(productId);
                          showToast('Removed from wishlist', 'success');
                        } else {
                          addToWishlist({
                            ...product,
                            id: productId,
                            name: productName,
                            price: productPrice ?? 0,
                            image: productImage
                          });
                          showToast('Added to wishlist!', 'success');
                        }
                      }}
                      className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isInWishlist(productId) ? 'text-red-500 fill-current' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    <div
                      className="h-64 bg-gray-50 cursor-pointer"
                      onClick={() =>
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
                              images: product.images || [productImage],
                              image: productImage,
                              rating: productRating,
                              numReviews: productReviews
                            }
                          }
                        })
                      }
                    >
                      <img src={productImage} alt={productName} className="w-full h-full object-contain p-4" />
                    </div>

                    <div className="p-4 space-y-3 font-sans">
                      <h3
                        className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green transition-colors line-clamp-2"
                        onClick={() =>
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
                                images: product.images || [productImage],
                                image: productImage,
                                rating: productRating,
                                numReviews: productReviews
                              }
                            }
                          })
                        }
                      >
                        {productName}
                      </h3>

                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i + 1 <= productRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({productReviews} reviews)</span>
                      </div>

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

                      {isComingSoon ? (
                        <button
                          onClick={() => openPriceModal(product)}
                          className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white"
                        >
                          Set Price
                        </button>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">No products found</h3>
            <p className="text-gray-600 font-sans">There are currently no beauty & skin care products available.</p>
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

export default BeautyProducts;
