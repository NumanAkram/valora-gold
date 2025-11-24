import React, { useState, useEffect, useRef } from 'react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Desktop banner images
  const desktopImages = ['/1.webp', '/2.webp', '/3.webp', '/4.webp', '/5.webp'];
  // Mobile banner images - only shown on mobile view
  const mobileImages = ['/mobile1.webp', '/mobile2.webp', '/mobile3.webp', '/mobile4.webp', '/mobile5.webp'];
  const images = desktopImages; // For slides count and navigation
  const intervalRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const bannerRef = useRef(null);

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

  // Minimum swipe distance (in pixels) to trigger slide change
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <section className="relative w-full bg-transparent lg:bg-white hero-section">
      {/* Responsive container: Full width, NO padding/margin on tablets/mobile - attached like reference website */}
      <div className="w-full max-w-full lg:max-w-none">
        <div className="relative w-full overflow-hidden">
          {/* Banner container: Full images on mobile/tablet, responsive on desktop - Touch swipe enabled */}
          <div 
            ref={bannerRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="relative w-full overflow-hidden rounded-none lg:rounded-none shadow-none bg-transparent hero-banner-container lg:aspect-[16/5.25] xl:aspect-[16/5.25] 2xl:aspect-[16/5.25] lg:min-h-[380px] xl:min-h-[380px] 2xl:min-h-[380px] touch-pan-y cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
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
            {/* Mobile images - only visible at 541px and below - Full width/height with cover */}
            <div 
              className="hidden max-[541px]:block w-full h-full"
              style={{
                backgroundImage: `url(${mobileImages[index]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '100%'
              }}
            >
              <img
                src={mobileImages[index]}
                alt={`Hero slide ${index + 1} - Mobile`}
                className="w-full h-full object-cover"
                style={{ display: 'none' }}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>

            {/* Desktop images - visible from 427px onwards (tablet and desktop views) */}
            <picture className="hidden min-[427px]:block">
              <source
                media="(min-width: 427px)"
                srcSet={image}
              />
              <img
                src={image}
                alt={`Hero slide ${index + 1} - Desktop`}
                className="w-full h-full hero-banner-image object-contain lg:object-contain xl:object-contain 2xl:object-contain"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </picture>
          </div>
            );
          })}

        {/* Navigation Arrows - Responsive positioning and fully functional on all devices */}
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Previous Arrow */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevious();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8 top-1/2 -translate-y-1/2 z-40 bg-white/95 hover:bg-white active:bg-white text-gray-800 rounded-full p-3 sm:p-3.5 md:p-4 lg:p-4 transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl backdrop-blur-sm cursor-pointer pointer-events-auto"
            style={{ 
              touchAction: 'manipulation', 
              WebkitTapHighlightColor: 'transparent',
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none'
            }}
            aria-label="Previous slide"
            type="button"
          >
            <svg className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 top-1/2 -translate-y-1/2 z-40 bg-white/95 hover:bg-white active:bg-white text-gray-800 rounded-full p-3 sm:p-3.5 md:p-4 lg:p-4 transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl backdrop-blur-sm cursor-pointer pointer-events-auto"
            style={{ 
              touchAction: 'manipulation', 
              WebkitTapHighlightColor: 'transparent',
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none'
            }}
            aria-label="Next slide"
            type="button"
          >
            <svg className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

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

