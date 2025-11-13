import React, { useEffect, useState } from 'react';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { getDisplayRating } from '../utils/ratings';
import { productsAPI } from '../utils/api';

const MAX_FEATURED = 4;

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productsAPI.getFeatured();
        if (response.success && Array.isArray(response.data)) {
          setProducts(response.data.slice(0, MAX_FEATURED));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    const handleProductAdded = (event) => {
      const newProduct = event.detail;
      if (!newProduct) return;

      setProducts((prev) => {
        const existsIndex = prev.findIndex(
          (item) => (item._id || item.id)?.toString() === (newProduct._id || newProduct.id)?.toString()
        );

        const updated = existsIndex >= 0
          ? prev.map((item, index) => (index === existsIndex ? { ...item, ...newProduct } : item))
          : [{ ...newProduct }, ...prev];

        return updated
          .filter(Boolean)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, MAX_FEATURED);
      });
    };

    window.addEventListener('product-added', handleProductAdded);
    return () => window.removeEventListener('product-added', handleProductAdded);
  }, []);

  const displayProducts = products.slice(0, MAX_FEATURED);

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Featured <span className="text-gradient">Collection</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular and exquisite gold jewelry pieces, 
            carefully selected for their beauty and craftsmanship.
          </p>
        </div>

        {/* Products Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 font-sans">
              No products available yet. Please check back soon.
            </div>
          ) : (
            displayProducts.map((product, index) => {
              const productId = product._id || product.id;
              const productName = product.name || product.title;
              const productImage = product.images?.[0] || product.image || '/4.webp';
              const productRating = getDisplayRating(product);
              const productReviews = product.numReviews || 0;
              const priceValue = typeof product.price === 'number' ? product.price : null;
              const originalPriceValue =
                typeof product.originalPrice === 'number' ? product.originalPrice : priceValue;
              const discount =
                priceValue !== null && originalPriceValue && originalPriceValue > priceValue
                  ? Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100)
                  : 0;

              return (
            <div key={productId} className="group card p-6 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              {/* Product Image */}
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gold-500 text-white">
                    New Arrival
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gold-50 transition-colors"
                    onClick={() => {
                      if (isInWishlist(productId)) {
                        removeFromWishlist(productId);
                        showToast('Removed from wishlist', 'success');
                      } else {
                        addToWishlist({ ...product, id: productId, image: productImage });
                        showToast('Added to wishlist!', 'success');
                      }
                    }}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(productId) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                  </button>
                  <button
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gold-50 transition-colors"
                    onClick={() =>
                      showToast('Open product details to view more information.', 'info')
                    }
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Quick Add Button */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="w-full bg-gold-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gold-700 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => {
                      if (priceValue === null) {
                        showToast('Price not available yet for this product.', 'info');
                        return;
                      }
                      addToCart({ ...product, id: productId, price: priceValue, image: productImage });
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Quick Add</span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gold-600 transition-colors">
                  {productName}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i + 1 <= productRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {productRating} ({productReviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  {priceValue !== null ? (
                    <>
                      <span className="text-2xl font-bold text-gold-600">
                        Rs.{priceValue.toLocaleString()}
                      </span>
                      {originalPriceValue && originalPriceValue > priceValue && (
                        <span className="text-lg text-gray-400 line-through">
                          Rs.{originalPriceValue.toLocaleString()}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          {discount}% OFF
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-gray-500 uppercase tracking-wide">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
              );
            })
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary text-lg px-8 py-4">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

