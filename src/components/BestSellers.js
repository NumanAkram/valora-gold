import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { productsAPI } from '../utils/api';

const BestSellers = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getBestSellers();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        // Fallback to empty array or show error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Mock products as fallback (remove this after seeding database)
  const mockProducts = [
    {
      id: 1,
      name: "Tea Tree Face Wash - 100ml For Acne & Pimples With Tea Tree & Salicylic Acid",
      price: "Rs.855",
      rating: 5,
      reviews: "76 reviews"
    },
    {
      id: 2,
      name: "Vitamin C Face Wash - 100ml For Bright & Radiant Skin With Vitamin C & Lemon",
      price: "Rs.855",
      rating: 5,
      reviews: "40 reviews"
    },
    {
      id: 3,
      name: "Onion Hair Oil - 100ml For Hair Fall Control With Onion & Almond Oil",
      price: "Rs.1,285",
      rating: 5,
      reviews: "41 reviews"
    },
    {
      id: 4,
      name: "Vitamin C Face Serum - 30ml For Bright & Radiant Skin With Vitamin C & Lemon",
      price: "Rs.1,350",
      rating: 5,
      reviews: "19 reviews"
    },
    {
      id: 5,
      name: "Tea Tree Face Serum - 30ml For Acne & Pimples With Neem, Tea Tree & Salicylic..",
      price: "Rs.1,350",
      rating: 5,
      reviews: "29 reviews"
    },
    {
      id: 6,
      name: "Onion Hair Oil - 150ml For Hair Fall Control With Onion & Almond Oil",
      price: "Rs.1,610",
      rating: 5,
      reviews: "47 reviews"
    },
    {
      id: 7,
      name: "Rosemary Hair Oil - 100ml For Long & Healthy Hair With Rosemary & Almond Oil",
      price: "Rs.1,285",
      rating: 5,
      reviews: "35 reviews"
    },
    {
      id: 8,
      name: "Hyaluronic Acid Face Serum - 30ml For Hydration & Skin Repair",
      price: "Rs.1,450",
      rating: 5,
      reviews: "28 reviews"
    },
    {
      id: 9,
      name: "Ubtan Face Wash - 100ml For Skin Glow & Tan Removal With Turmeric & Saffron",
      price: "Rs.855",
      rating: 5,
      reviews: "52 reviews"
    }
  ];

  // Use API products or fallback to mock
  const displayProducts = products.length > 0 ? products : mockProducts;

  const nextSlide = () => {
    if (displayProducts.length <= 5) return;
    setCurrentIndex((prev) => (prev + 1) % (displayProducts.length - 4));
  };

  const prevSlide = () => {
    if (displayProducts.length <= 5) return;
    setCurrentIndex((prev) => (prev - 1 + (displayProducts.length - 4)) % (displayProducts.length - 4));
  };

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

  return (
    <section className="bg-white py-6 sm:py-8 md:py-12 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-logo-green text-center mb-6 sm:mb-8 md:mb-12 uppercase tracking-wide font-sans">
          OUR BEST SELLERS
        </h2>

        {/* Carousel Container */}
        <div className="relative w-full">
          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full items-center justify-center hover:bg-gray-300 transition-colors duration-300"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-gray-600" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full items-center justify-center hover:bg-gray-300 transition-colors duration-300"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-gray-600" />
          </button>

          {/* Products Carousel - Responsive */}
          <div className="flex justify-start md:justify-center space-x-2 sm:space-x-3 md:space-x-4 px-2 sm:px-4 md:px-8 lg:px-20 overflow-x-auto scrollbar-hide">
            {displayProducts.slice(currentIndex, Math.min(currentIndex + 5, displayProducts.length)).map((product) => {
              // Format product data for display
              const productId = product._id || product.id;
              const productName = product.name;
              const productPrice = product.price ? `Rs.${product.price.toLocaleString()}` : (product.originalPrice ? `Rs.${product.originalPrice.toLocaleString()}` : 'Rs.0');
              const productImage = product.images?.[0] || product.image || '/4.png';
              const productRating = product.rating || 5;
              const productReviews = product.numReviews || 0;
              
              return (
              <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex-shrink-0 w-[280px] sm:w-[300px] md:w-80 relative">
                 {/* Wishlist Button */}
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

                 {/* Product Image - Clickable */}
                 <div 
                   className="relative h-64 sm:h-80 md:h-96 bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId } } })}
                 >
                   <img
                     src={productImage}
                     alt={productName}
                     className="w-full h-full object-cover"
                   />
                 </div>

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
                           className={`h-4 w-4 ${i < Math.floor(productRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                         />
                       ))}
                     </div>
                     <span className="text-xs text-gray-600">{productReviews} reviews</span>
                   </div>

                   {/* Price */}
                   <div className="text-base font-bold text-gray-900">
                     {productPrice}
                   </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={() => {
                      addToCart({ ...product, id: productId, price: product.price || product.originalPrice, image: productImage });
                      showToast('Product added to cart!', 'success');
                    }}
                    className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase hover:bg-logo-green hover:text-white transition-colors duration-300"
                  >
                    ADD TO CART
                  </button>
                 </div>
              </div>
             );
           })}
           </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
