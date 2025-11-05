import React from 'react';

const FeaturesBanner = () => {
  return (
    <section className="bg-white py-4 sm:py-6 md:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <img
            src="/3.png"
            alt="Best of Nature Features"
            className="w-full max-w-full sm:max-w-6xl h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
