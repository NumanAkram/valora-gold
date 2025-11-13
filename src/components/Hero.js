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
    <section className="relative w-full bg-white">
      <div className="mx-auto w-full max-w-[1500px] px-0">
        <div className="relative w-full overflow-hidden">
          <div className="relative w-full overflow-hidden rounded-none sm:rounded-3xl shadow-none aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5.75] lg:aspect-[16/5.25] xl:aspect-[16/4.8] 2xl:aspect-[16/4.5] min-h-[260px] sm:min-h-[300px] md:min-h-[340px] lg:min-h-[380px] xl:min-h-[410px]">
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
                className={`absolute inset-0 w-full h-full transition-all duration-[1500ms] ease-in-out transform ${positionClass}`}
          >
            <img
              src={image}
              alt={`Hero slide ${index + 1}`}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
            );
          })}

        <button
          onClick={goToPrevious}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-2.5 transition-all duration-300 hover:scale-110 shadow-lg"
          aria-label="Previous slide"
        >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-2.5 transition-all duration-300 hover:scale-110 shadow-lg"
          aria-label="Next slide"
        >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                  index === currentSlide ? 'bg-white w-8 h-2' : 'bg-white/60 w-2 h-2 hover:bg-white'
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
