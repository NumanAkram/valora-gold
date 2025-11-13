import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CATEGORIES from '../constants/categories';

const ShopByCategory = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  
  const categories = CATEGORIES.map((category, index) => ({
    id: index,
    name: category.label,
    image: category.image,
    link: category.path,
  }));

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= categories.length ? 0 : next;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev - 1;
      return next < 0 ? categories.length - 1 : next;
    });
  };

  const visibleCategories = (() => {
    const totalToShow = 3;
    if (categories.length <= totalToShow) {
      return categories;
    }

    const looped = [...categories, ...categories];
    return looped.slice(currentIndex, currentIndex + totalToShow);
  })();

  return (
    <section id="shop-by-category" className="bg-white py-8 md:py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Responsive layout */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 md:mb-12">
          {/* Left Side - Title and Link */}
          <div className="flex flex-col w-full lg:w-1/4 mb-6 lg:mb-0 lg:ml-8 xl:ml-16 2xl:ml-32">
            <h2 className="text-2xl md:text-3xl font-bold text-logo-green uppercase tracking-wide font-sans leading-tight">
              SHOP BY CATEGORY
            </h2>
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
            <div className="flex justify-center space-x-4 md:space-x-6 px-4 lg:px-20">
              {visibleCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex-shrink-0 w-64 md:w-72 cursor-pointer"
                  onClick={() => navigate(category.link)}
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
