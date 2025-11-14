import React, { useState, useEffect, useRef } from 'react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Using the banner images - adjust paths if your images have different names
  const images = ['/1.webp', '/2.webp', '/3.webp', '/4.webp', '/5.webp'];
  const intervalRef = useRef(null);

  // Auto-slide every 5 seconds with smooth transition
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Reset timer when manually changing slides
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
  };

  const goToPrevious = () => {
    goToSlide((currentSlide - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    goToSlide((currentSlide + 1) % images.length);
  };

  return (
    <section className="relative w-full bg-transparent lg:bg-white hero-section">
      {/* Responsive container: Full width, NO padding/margin on tablets/mobile - attached like reference website */}
      <div className="w-full max-w-full lg:max-w-none">
        <div className="relative w-full overflow-hidden">
          {/* Banner container: Full images on mobile/tablet, responsive on desktop */}
          <div className="relative w-full overflow-hidden rounded-none lg:rounded-none shadow-none bg-transparent hero-banner-container lg:aspect-[16/5.25] xl:aspect-[16/4.8] 2xl:aspect-[16/4.5] lg:min-h-[380px] xl:min-h-[410px]">
          {images.map((image, index) => {
            const isActive = index === currentSlide;
            const positionClass = (() => {
              if (isActive) return 'translate-x-0 opacity-100 z-20';
              if ((index + 1) % images.length === currentSlide) return '-translate-x-full opacity-0 z-10';
              return 'translate-x-full opacity-0 z-10';
            })();

            return (
          <div
            key={index}
                className={`absolute inset-0 w-full h-full lg:h-full transition-all duration-[1500ms] ease-in-out transform ${positionClass}`}
          >
            {/* Same image used for all devices - responsive like Mama Organic */}
            <picture>
              {/* Same image source for all breakpoints */}
              <source
                media="(min-width: 1024px)"
                srcSet={image}
              />
              <source
                media="(min-width: 768px)"
                srcSet={image}
              />
              <source
                media="(min-width: 640px)"
                srcSet={image}
              />
              <source
                media="(min-width: 480px)"
                srcSet={image}
              />
              <img
                src={image}
                alt={`Hero slide ${index + 1}`}
                className="w-full h-full hero-banner-image"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </picture>
          </div>
            );
          })}

        {/* Navigation Arrows - Responsive positioning */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-2.5 md:p-3 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-2.5 md:p-3 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator - Responsive positioning and sizing */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1.5 sm:space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide 
                  ? 'bg-white w-6 h-1.5 sm:w-8 sm:h-2 md:w-10 md:h-2.5' 
                  : 'bg-white/60 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
