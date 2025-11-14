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
                src="/Our Mission WEBP.webp"
                alt="Our Mission"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Side - Mission Statement */}
          <div className="w-full lg:w-1/2 space-y-3 md:space-y-4">
            {/* Mission Title */}
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-logo-green uppercase tracking-wide font-sans">
              Our Mission – Purity Rooted in Nature
            </h3>

            {/* Mission Description */}
            <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed font-sans text-justify">
              At Valora Gold, we are driven by a passion for purity and perfection. Our mission is to craft premium, 100% organic, chemical-free products inspired by nature's finest ingredients. We believe true beauty begins with wellness; that's why every Valora Gold creation reflects authenticity, purity, and care. Our goal is to help you embrace a healthier, more radiant lifestyle, naturally.
            </p>

            {/* Certification Logos - Close to text */}
            <div className="flex justify-center lg:justify-start py-1">
              <div className="flex items-center justify-center">
                <img
                  src="/7.webp"
                  alt="Certification Logos"
                  className="w-48 md:w-64 lg:w-72 h-16 md:h-24 lg:h-28 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeKnowYourNeeds;
