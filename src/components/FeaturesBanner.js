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
    <section className="bg-[#fff7eb] w-full">
      <div className="max-w-full mx-auto">
        {/* 4 blocks continuously displayed in flex-row on all devices */}
        <div className="flex flex-row items-stretch">
          {featureCards.map(({ title, subtitle, Icon }, index) => (
            <React.Fragment key={`${title}-${subtitle}`}>
              {/* Vertical divider between sections */}
              {index > 0 && (
                <div className="w-px bg-[#1a4d1a]"></div>
              )}
              {/* Each section: icon and text display block (stacked) */}
              <div className="flex-1 flex items-center justify-center px-2 sm:px-3 md:px-4 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-7">
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-2 md:gap-3 lg:gap-4">
                  {/* Circular icon with dark green outline - Display block */}
                  <div className="block w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full border-2 border-[#1a4d1a] bg-transparent flex items-center justify-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#1a4d1a]" strokeWidth={1.5} />
                  </div>
                  
                  {/* Stacked text - Display block */}
                  <div className="block text-center">
                    <span className="block font-semibold text-[#1a4d1a] uppercase tracking-wide text-[10px] sm:text-xs md:text-sm lg:text-lg leading-tight font-sans">
                      {title}
                    </span>
                    <span className="block font-semibold text-[#1a4d1a] uppercase tracking-wide text-[10px] sm:text-xs md:text-sm lg:text-lg leading-tight font-sans">
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
