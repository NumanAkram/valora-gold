import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ShopByCategory = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  
  const categories = [
    {
      id: 1,
      name: "Hair Oil",
      image: "/5.png"
    },
    {
      id: 2,
      name: "Hair Shampoo", 
      image: "/5.png"
    },
    {
      id: 3,
      name: "Face Wash",
      image: "/5.png"
    },
    {
      id: 4,
      name: "Face Serum",
      image: "/5.png"
    },
    {
      id: 5,
      name: "Face Cream",
      image: "/5.png"
    },
    {
      id: 6,
      name: "Face Moisturizer",
      image: "/5.png"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (categories.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (categories.length - 3)) % (categories.length - 3));
  };

  return (
    <section className="bg-white py-8 md:py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Responsive layout */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 md:mb-12">
          {/* Left Side - Title and Link */}
          <div className="flex flex-col w-full lg:w-1/4 mb-6 lg:mb-0 lg:ml-8 xl:ml-16 2xl:ml-32">
            <h2 className="text-2xl md:text-3xl font-bold text-logo-green uppercase tracking-wide font-sans leading-tight">
              SHOP BY CATEGORY
            </h2>
            <a href="#" className="text-gray-600 text-sm underline hover:text-logo-green transition-colors mt-2">
              VIEW ALL
            </a>
          </div>

          {/* Right Side - Carousel */}
          <div className="relative w-full lg:w-3/4">
            {/* Navigation Arrows - Hidden on mobile */}
            <button
              onClick={prevSlide}
              className="hidden lg:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-logo-green rounded-full items-center justify-center hover:bg-banner-green transition-colors duration-300"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>

            <button
              onClick={nextSlide}
              className="hidden lg:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-logo-green rounded-full items-center justify-center hover:bg-banner-green transition-colors duration-300"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>

            {/* Categories Carousel - Responsive */}
            <div className="flex space-x-2 md:space-x-3 px-4 lg:px-20 overflow-x-auto scrollbar-hide">
              {categories.slice(currentIndex, currentIndex + 4).map((category) => (
                <div 
                  key={category.id} 
                  className="bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex-shrink-0 w-64 md:w-72 cursor-pointer"
                  onClick={() => navigate('/shop-all')}
                >
                  {/* Category Image */}
                  <div className="relative h-80 md:h-96 bg-gray-50">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Category Name */}
                  <div className="p-3 md:p-4 text-center">
                    <h3 className="text-sm md:text-base font-semibold text-logo-green font-sans hover:underline">
                      {category.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ShopByCategory;
