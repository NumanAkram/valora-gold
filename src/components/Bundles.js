import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { productsAPI } from '../utils/api';

const Bundles = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await productsAPI.getAll({ category: 'Bundles' });
        if (response.success) {
          setBundles(response.data);
        }
      } catch (error) {
        console.error('Error fetching bundles:', error);
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  // Mock bundles as fallback
  const mockBundles = [
    {
      id: 1,
      title: "Tea Tree Acne Control Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      originalPrice: "Rs.3,337",
      salePrice: "Rs.2,836",
      rating: 5,
      reviews: "12 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    },
    {
      id: 2,
      title: "Onion Hair Fall Control Bundle | Oil 100ml + Shampoo 250ml + Conditioner 250ml",
      originalPrice: "Rs.3,769",
      salePrice: "Rs.3,203",
      rating: 5,
      reviews: "9 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    },
    {
      id: 3,
      title: "Retinol Anti Aging Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      originalPrice: "Rs.3,812",
      salePrice: "Rs.3,240",
      rating: 5,
      reviews: "7 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    },
    {
      id: 4,
      title: "Ubtan Glow & Tan Removal Kit | Face Wash 100ml + Serum 30ml + Cream 50g",
      originalPrice: "Rs.3,595",
      salePrice: "Rs.3,055",
      rating: 5,
      reviews: "15 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    },
    {
      id: 5,
      title: "Vitamin C Skin Brightening Kit | Face Wash 100ml + Face Serum 30ml + Night Cream 50g",
      originalPrice: "Rs.3,553",
      salePrice: "Rs.3,020",
      rating: 5,
      reviews: "11 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    },
    {
      id: 6,
      title: "Ubtan Facial Kit for Skin Glow | Cleanser 60ml + Scrub 60ml + Soothing Gel 60ml + Massage Cream 60ml + Mask 60ml + Glow Cream 60ml",
      originalPrice: "Rs.2,160",
      salePrice: "Rs.1,836",
      rating: 5,
      reviews: "8 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    },
    {
      id: 7,
      title: "Onion Hair Fall Control Bundle | Oil 100ml + Shampoo 250ml",
      originalPrice: "Rs.2,527",
      salePrice: "Rs.2,147",
      rating: 5,
      reviews: "13 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    },
    {
      id: 8,
      title: "Rosemary Hair Growth Bundle 2 | Rosemary Oil 100ml + Rosemary Shampoo 250ml",
      originalPrice: "Rs.2,527",
      salePrice: "Rs.2,147",
      rating: 5,
      reviews: "6 reviews",
      saleBadge: "Sale 15%",
      image: "/4.png"
    }
  ];

  // Use API bundles or fallback to mock
  const displayBundles = bundles.length > 0 ? bundles : mockBundles;

  // Navigation removed - only showing 4 products

  if (loading) {
    return (
      <section className="bg-white py-12 w-full">
        <div className="w-full px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-logo-green text-center mb-12 uppercase tracking-wide font-sans">
            Other Products
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-600 font-sans">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-6 sm:py-8 md:py-12 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Title - Centered */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-logo-green text-center mb-6 sm:mb-8 md:mb-12 uppercase tracking-wide font-sans">
          Other Products
        </h2>

        {/* Products Container */}
        <div className="relative w-full">
          {/* Other Products Grid - Show only 4 products */}
          <div className="flex justify-start md:justify-center space-x-2 sm:space-x-3 md:space-x-4 px-2 sm:px-4 md:px-8 lg:px-20 overflow-x-auto scrollbar-hide">
            {displayBundles.slice(0, 4).map((bundle) => {
              // Format bundle data from API
              const bundleId = bundle._id || bundle.id;
              const bundleTitle = bundle.name || bundle.title;
              const bundlePrice = bundle.price || bundle.originalPrice || 0;
              const bundleOriginalPrice = bundle.originalPrice || null;
              const bundleImage = bundle.images?.[0] || bundle.image || '/4.png';
              const bundleRating = bundle.rating || 5;
              const bundleReviews = bundle.numReviews || 0;
              const hasSale = bundleOriginalPrice && bundleOriginalPrice > bundlePrice;
              const salePercent = hasSale ? Math.round(((bundleOriginalPrice - bundlePrice) / bundleOriginalPrice) * 100) : 0;
              
              return (
              <div key={bundleId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex-shrink-0 w-[280px] sm:w-[300px] md:w-80 relative">
                {/* Sale Badge - Top Left Corner - Responsive */}
                {hasSale && (
                  <div className="absolute top-1 left-1 md:top-2 md:left-2 z-10">
                    <div className="bg-logo-green text-white text-xs md:text-sm font-bold px-1 py-0.5 md:px-2 md:py-1 rounded-full">
                      Sale {salePercent}%
                    </div>
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={() => {
                    if (isInWishlist(bundleId)) {
                      removeFromWishlist(bundleId);
                      showToast('Removed from wishlist', 'success');
                    } else {
                      addToWishlist({ ...bundle, id: bundleId, name: bundleTitle, price: bundlePrice, image: bundleImage });
                      showToast('Added to wishlist!', 'success');
                    }
                  }}
                  className="absolute top-1 right-1 md:top-2 md:right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(bundleId) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                </button>

                {/* Bundle Image - Clickable */}
                <div 
                  className="relative h-60 sm:h-72 md:h-80 bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/product/${bundleId}`, { state: { product: { ...bundle, id: bundleId, _id: bundleId, name: bundleTitle, title: bundleTitle, price: bundlePrice, originalPrice: bundleOriginalPrice, images: bundle.images || [bundleImage], image: bundleImage, rating: bundleRating, numReviews: bundleReviews } } })}
                >
                  <img
                    src={bundleImage}
                    alt={bundleTitle}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Bundle Details */}
                <div className="p-4 space-y-3 font-sans">
                  {/* Bundle Title - Clickable */}
                  <h3 
                    className="text-sm font-medium text-gray-800 leading-tight h-12 overflow-hidden cursor-pointer hover:text-logo-green transition-colors"
                    onClick={() => navigate(`/product/${bundleId}`, { state: { product: { ...bundle, id: bundleId, _id: bundleId, name: bundleTitle, title: bundleTitle, price: bundlePrice, originalPrice: bundleOriginalPrice, images: bundle.images || [bundleImage], image: bundleImage, rating: bundleRating, numReviews: bundleReviews } } })}
                  >
                    {bundleTitle}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(bundleRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">{bundleReviews} reviews</span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-600">
                      Rs.{bundlePrice.toLocaleString()}
                    </span>
                    {bundleOriginalPrice && bundleOriginalPrice > bundlePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        Rs.{bundleOriginalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={() => {
                      addToCart({ 
                        ...bundle, 
                        id: bundleId,
                        name: bundleTitle,
                        price: bundlePrice,
                        image: bundleImage
                      });
                      showToast('Bundle added to cart!', 'success');
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
        </div>

        {/* View More Button */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <button
            onClick={() => navigate('/other-products')}
            className="bg-logo-green text-white font-bold py-3 px-8 rounded-lg text-sm uppercase hover:bg-banner-green transition-colors duration-300 font-sans"
          >
            View More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Bundles;
