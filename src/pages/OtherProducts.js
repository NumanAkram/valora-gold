import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { productsAPI } from '../utils/api';

const OtherProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock products as fallback (same as Bundles component)
  const mockProducts = [
    {
      id: 1,
      name: "Tea Tree Acne Control Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      title: "Tea Tree Acne Control Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      price: 2836,
      originalPrice: 3337,
      rating: 5,
      numReviews: 12,
      image: "/4.png"
    },
    {
      id: 2,
      name: "Onion Hair Fall Control Bundle | Oil 100ml + Shampoo 250ml + Conditioner 250ml",
      title: "Onion Hair Fall Control Bundle | Oil 100ml + Shampoo 250ml + Conditioner 250ml",
      price: 3203,
      originalPrice: 3769,
      rating: 5,
      numReviews: 9,
      image: "/4.png"
    },
    {
      id: 3,
      name: "Retinol Anti Aging Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      title: "Retinol Anti Aging Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      price: 3240,
      originalPrice: 3812,
      rating: 5,
      numReviews: 7,
      image: "/4.png"
    },
    {
      id: 4,
      name: "Ubtan Glow & Tan Removal Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      title: "Ubtan Glow & Tan Removal Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      price: 3055,
      originalPrice: 3595,
      rating: 5,
      numReviews: 15,
      image: "/4.png"
    },
    {
      id: 5,
      name: "Vitamin C Skin Brightening Kit | Face Wash 100ml + Face Serum 30ml + Night Cream 50g",
      title: "Vitamin C Skin Brightening Kit | Face Wash 100ml + Face Serum 30ml + Night Cream 50g",
      price: 3020,
      originalPrice: 3553,
      rating: 5,
      numReviews: 11,
      image: "/4.png"
    },
    {
      id: 6,
      name: "Ubtan Facial Kit for Skin Glow | Cleanser 60ml + Scrub 60ml + Soothing Gel 60ml + Massage Cream 60ml + Mask 60ml + Glow Cream 60ml",
      title: "Ubtan Facial Kit for Skin Glow | Cleanser 60ml + Scrub 60ml + Soothing Gel 60ml + Massage Cream 60ml + Mask 60ml + Glow Cream 60ml",
      price: 1836,
      originalPrice: 2160,
      rating: 5,
      numReviews: 8,
      image: "/4.png"
    },
    {
      id: 7,
      name: "Onion Hair Fall Control Bundle | Oil 100ml + Shampoo 250ml",
      title: "Onion Hair Fall Control Bundle | Oil 100ml + Shampoo 250ml",
      price: 2147,
      originalPrice: 2527,
      rating: 5,
      numReviews: 13,
      image: "/4.png"
    },
    {
      id: 8,
      name: "Rosemary Hair Growth Bundle 2 | Rosemary Oil 100ml + Rosemary Shampoo 250ml",
      title: "Rosemary Hair Growth Bundle 2 | Rosemary Oil 100ml + Rosemary Shampoo 250ml",
      price: 2147,
      originalPrice: 2527,
      rating: 5,
      numReviews: 6,
      image: "/4.png"
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Try to fetch from API first
        const response = await productsAPI.getAll({ limit: 100 });
        console.log('Other Products API Response:', response);
        if (response && response.success && response.data && response.data.length > 0) {
          // Show all products from API
          setProducts(response.data);
        } else {
          // Fallback to mock products if API doesn't return data
          console.warn('API returned no products, using mock data');
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Error fetching products, using mock data:', error);
        // Fallback to mock products on error
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'Other Products', path: '/other-products' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-logo-green mb-2 font-sans uppercase tracking-wide">
            Other Products
          </h1>
          <p className="text-gray-600 font-sans">
            Explore our complete collection of products
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
                const productPrice = product.price || 0;
                const productOriginalPrice = product.originalPrice || null;
                const productImage = product.images?.[0] || product.image || '/4.png';
                const productRating = product.rating || 5;
                const productReviews = product.numReviews || 0;
                const hasSale = productOriginalPrice && productOriginalPrice > productPrice;
                const salePercent = hasSale ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100) : 0;

                return (
                  <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
                    {/* Sale Badge */}
                    {hasSale && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-logo-green text-white text-xs font-bold px-2 py-1 rounded-full">
                          Sale {salePercent}%
                        </div>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => {
                        if (isInWishlist(productId)) {
                          removeFromWishlist(productId);
                          showToast('Removed from wishlist', 'success');
                        } else {
                          addToWishlist({ ...product, id: productId, name: productName, price: productPrice, image: productImage });
                          showToast('Added to wishlist!', 'success');
                        }
                      }}
                      className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${isInWishlist(productId) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                    </button>

                    {/* Product Image */}
                    <div
                      className="h-64 bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, _id: productId, name: productName, title: productName, price: productPrice, originalPrice: productOriginalPrice, images: product.images || [productImage], image: productImage, rating: productRating, numReviews: productReviews } } })}
                    >
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-3 font-sans">
                      {/* Product Title */}
                      <h3
                        className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green transition-colors line-clamp-2"
                        onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, _id: productId, name: productName, title: productName, price: productPrice, originalPrice: productOriginalPrice, images: product.images || [productImage], image: productImage, rating: productRating, numReviews: productReviews } } })}
                      >
                        {productName}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(productRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({productReviews} reviews)
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-red-600">
                          Rs.{productPrice.toLocaleString()}
                        </span>
                        {productOriginalPrice && productOriginalPrice > productPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            Rs.{productOriginalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => {
                          addToCart({
                            ...product,
                            id: productId,
                            name: productName,
                            price: productPrice,
                            image: productImage
                          });
                          showToast('Product added to cart!', 'success');
                        }}
                        className="w-full border border-logo-green text-logo-green bg-white font-bold py-2 px-4 rounded text-sm uppercase hover:bg-logo-green hover:text-white transition-colors duration-300"
                      >
                        ADD TO CART
                      </button>
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
              There are currently no products available in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherProducts;

