import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ShopByConcern = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const concerns = [
    {
      id: 1,
      name: "Wrinkles & Fine Lines",
      image: "/5.png"
    },
    {
      id: 2,
      name: "Anti Aging",
      image: "/5.png"
    },
    {
      id: 3,
      name: "Pigmentation",
      image: "/5.png"
    },
    {
      id: 4,
      name: "Open Pores",
      image: "/5.png"
    },
    {
      id: 5,
      name: "Dark Circles & Puffiness",
      image: "/5.png"
    },
    {
      id: 6,
      name: "Acne & Pimples",
      image: "/5.png"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (concerns.length - 5));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (concerns.length - 5)) % (concerns.length - 5));
  };

  return (
    <section className="bg-white py-6 sm:py-8 md:py-12 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Title - Centered */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-logo-green text-center mb-6 sm:mb-8 md:mb-12 uppercase tracking-wide font-sans">
          SHOP BY CONCERN
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

          {/* Concerns Carousel - Responsive */}
          <div className="flex justify-start md:justify-center space-x-2 sm:space-x-3 px-2 sm:px-4 md:px-8 lg:px-20 overflow-x-auto scrollbar-hide">
            {concerns.slice(currentIndex, Math.min(currentIndex + 6, concerns.length)).map((concern) => (
              <div key={concern.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex-shrink-0 w-36 sm:w-40 md:w-48">
                {/* Concern Image */}
                <div className="relative h-40 sm:h-48 md:h-56 bg-gray-50">
                  <img
                    src={concern.image}
                    alt={concern.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Concern Name */}
                <div className="p-2 text-center">
                  <h3 className="text-sm font-semibold text-logo-green font-sans">
                    {concern.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByConcern;
