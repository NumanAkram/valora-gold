import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const CustomerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const reviews = [
    {
      id: 1,
      customerName: "Ayesha Khan",
      productTitle: "Classic Gold Necklace Set",
      reviewText: "Absolutely stunning piece! The quality is exceptional and the design is timeless. Perfect for special occasions. Highly recommended from Valora Gold!",
      rating: 5,
      productImage: "/4.webp",
      productLink: "Classic Gold Necklace Set",
      date: "2 days ago"
    },
    {
      id: 2,
      customerName: "Ahmed Ali",
      productTitle: "Gold Bracelet Collection",
      reviewText: "I'm buying from Valora Gold for the second time. The authenticity and craftsmanship are outstanding. My wife loves it!",
      rating: 5,
      productImage: "/4.webp",
      productLink: "Gold Bracelet Collection",
      date: "5 days ago"
    },
    {
      id: 3,
      customerName: "Fatima Sheikh",
      productTitle: "Gold Earrings Set",
      reviewText: "The quality is excellent and the design is elegant. Valora Gold never disappoints. Will definitely shop again!",
      rating: 5,
      productImage: "/4.webp",
      productLink: "Gold Earrings Set",
      date: "1 week ago"
    },
    {
      id: 4,
      customerName: "Hassan Raza",
      productTitle: "Premium Gold Ring",
      reviewText: "Excellent quality gold ring! The finish is perfect and the design is exactly as shown. Valora Gold's authenticity is unmatched. Very happy with my purchase! 😍❤️",
      rating: 5,
      productImage: "/4.webp",
      productLink: "Premium Gold Ring",
      date: "2 weeks ago"
    },
    {
      id: 5,
      customerName: "Sara Ahmed",
      productTitle: "Diamond Gold Collection",
      reviewText: "I was looking for authentic gold jewelry, tried Valora Gold and found it amazing. The certification and quality are top-notch. Highly recommended.",
      rating: 5,
      productImage: "/4.webp",
      productLink: "Diamond Gold Collection",
      date: "3 weeks ago"
    },
    {
      id: 6,
      customerName: "Mohammad Usman",
      productTitle: "Gold Chain Collection",
      reviewText: "Great quality and excellent service. The gold is 100% authentic as promised. Very satisfied with my purchase!",
      rating: 4.5,
      productImage: "/4.webp",
      productLink: "Gold Chain Collection",
      date: "1 month ago"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (reviews.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (reviews.length - 3)) % (reviews.length - 3));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <section className="bg-gray-50 py-6 sm:py-8 md:py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-logo-green mb-2 font-sans">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-gray-600 text-xs sm:text-sm font-sans">from 500+ verified reviews</span>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-logo-green rounded flex items-center justify-center">
              <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
            </div>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full items-center justify-center hover:bg-gray-300 transition-colors duration-300"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full items-center justify-center hover:bg-gray-300 transition-colors duration-300"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </button>

          {/* Reviews Grid - Responsive */}
          <div className="flex justify-start md:justify-center space-x-3 sm:space-x-4 px-2 sm:px-8 md:px-16 overflow-x-auto scrollbar-hide">
            {reviews.slice(currentIndex, currentIndex + 4).map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex-shrink-0 w-[280px] sm:w-[320px] md:w-80">
                {/* Product Image */}
                <div className="relative h-48 sm:h-56 md:h-64 bg-gray-50">
                  <img
                    src={review.productImage}
                    alt={review.productTitle}
                    className="w-full h-full object-contain p-4"
                  />
                </div>

                {/* Review Content */}
                <div className="p-4 space-y-3">
                  {/* Star Rating */}
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center space-x-2">
                    <span className="text-logo-green font-semibold text-sm font-sans">
                      {review.customerName}
                    </span>
                    <div className="bg-logo-green text-white text-xs px-2 py-0.5 rounded font-sans">
                      Verified
                    </div>
                  </div>

                  {/* Product Title */}
                  <h3 className="text-sm font-medium text-gray-800 font-sans">
                    {review.productTitle}
                  </h3>

                  {/* Review Text */}
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {review.reviewText}
                  </p>

                  {/* Product Link & Date */}
                  <div className="pt-2 flex items-center justify-between">
                    <a href="#" className="text-xs text-logo-green hover:underline font-sans">
                      {review.productLink}
                    </a>
                    {review.date && (
                      <span className="text-xs text-gray-400 font-sans">
                        {review.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Reviews Button */}
        <div className="text-center mt-8">
          <button className="bg-logo-green text-white font-bold py-3 px-8 rounded-lg text-sm uppercase hover:bg-banner-green transition-colors duration-300 font-sans">
            View All Reviews
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
