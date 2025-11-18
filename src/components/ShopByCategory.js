import React from 'react';
import { useNavigate } from 'react-router-dom';
import CATEGORIES from '../constants/categories';

const ShopByCategory = () => {
  const navigate = useNavigate();
  
  // Use all categories including "All Products"
  const categories = CATEGORIES.map((category, index) => ({
    id: index,
    name: category.label,
    image: category.image,
    link: category.path,
  }));



  return (
    <section id="shop-by-category" className="bg-white py-8 md:py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 md:mb-12">
          {/* Left Side - Title */}
          <div className="flex flex-col w-full lg:w-1/4 mb-6 lg:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-logo-green uppercase tracking-wide font-sans leading-tight">
              SHOP BY CATEGORY
            </h2>
          </div>
        </div>

        {/* Categories Grid - All 5 categories visible on all devices with responsive widths */}
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {categories.map((category, idx) => (
              <div
                key={`${category.id}-${idx}`}
                onClick={() => navigate(category.link)}
                className="bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                {/* Category Image */}
                <div className="relative bg-gray-50 w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Category Name */}
                <div className="p-3 sm:p-4 md:p-5 text-center">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-logo-green font-sans group-hover:underline transition-all duration-300">
                    {category.name}
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

export default ShopByCategory;
