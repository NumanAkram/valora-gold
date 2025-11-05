import React from 'react';

const WeKnowYourNeeds = () => {
  return (
    <section className="bg-white py-4 sm:py-6 md:py-8 w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title with decorative lines */}
        <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
          <div className="flex-1 h-px bg-logo-green hidden sm:block"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-logo-green uppercase tracking-wide font-sans mx-2 sm:mx-3 md:mx-6 px-2 sm:px-0">
            WE KNOW YOUR NEEDS
          </h2>
          <div className="flex-1 h-px bg-logo-green hidden sm:block"></div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
          {/* Left Side - Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
            <div className="relative max-w-xs lg:max-w-sm">
              <img
                src="/6.png"
                alt="Natural & Healthy Environment"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Side - Mission Statement */}
          <div className="w-full lg:w-1/2 space-y-3 md:space-y-4">
            {/* Mission Title */}
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-logo-green uppercase tracking-wide font-sans">
              OUR MISSION – GOODNESS OF NATURE
            </h3>

            {/* Mission Description */}
            <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed font-sans">
              At Valora Gold, we believe in the power of nature. Our commitment is to make our community happier and healthier by sharing the goodness of natural beauty and self-care.
            </p>

            {/* Certification Logos - Close to text */}
            <div className="flex justify-center lg:justify-start py-1">
              <div className="flex items-center justify-center">
                <img
                  src="/7.png"
                  alt="Certification Logos"
                  className="w-48 md:w-64 lg:w-72 h-16 md:h-24 lg:h-28 object-contain"
                />
              </div>
            </div>

            {/* Learn More Button - Close to image */}
            <div className="flex justify-center lg:justify-start pt-1">
              <button className="bg-gray-800 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded text-xs md:text-sm uppercase hover:bg-gray-900 transition-all duration-300 font-sans shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                LEARN MORE
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeKnowYourNeeds;
