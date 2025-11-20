import React from 'react';
import { Leaf, FlaskConical, Heart, ShieldCheck } from 'lucide-react';

const featureCards = [
  {
    title: 'BEST OF',
    subtitle: 'NATURE',
    Icon: Leaf,
  },
  {
    title: 'NO',
    subtitle: 'TOXINS',
    Icon: FlaskConical,
  },
  {
    title: 'CRUELTY',
    subtitle: 'FREE',
    Icon: Heart,
  },
  {
    title: 'SAFE &',
    subtitle: 'CERTIFIED',
    Icon: ShieldCheck,
  },
];

const FeaturesBanner = () => {
  return (
    <section className="bg-[#fff7eb] w-full mt-[20px]">
      <div className="max-w-full mx-auto">
        {/* 4 blocks continuously displayed in flex-row on all devices */}
        <div className="flex flex-row items-stretch gap-x-0 md:gap-x-2">
          {featureCards.map(({ title, subtitle, Icon }, index) => (
            <React.Fragment key={`${title}-${subtitle}`}>
              {/* Vertical divider between sections - Visible on all views and bold */}
              {index > 0 && (
                <div className="w-[2px] bg-banner-green"></div>
              )}
              {/* Each section: icon and text display block (stacked) */}
              <div className="flex-1 flex items-center justify-center px-2 sm:px-3 md:px-4 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-7">
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-2 md:gap-3 lg:gap-4">
                  {/* Circular icon with bright green outline - Display block */}
                  <div className="block w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full border-2 border-banner-green bg-transparent flex items-center justify-center">
                    <Icon className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-banner-green" strokeWidth={1.5} />
                  </div>
                  
                  {/* Stacked text - Display block */}
                  <div className="block text-center">
                    <span className="block font-semibold text-banner-green uppercase tracking-wide text-[10px] sm:text-xs md:text-sm lg:text-lg leading-tight font-sans">
                      {title}
                    </span>
                    <span className="block font-semibold text-banner-green uppercase tracking-wide text-[10px] sm:text-xs md:text-sm lg:text-lg leading-tight font-sans">
                      {subtitle}
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
