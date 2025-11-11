import React from 'react';
import { Leaf, FlaskConical, HeartHandshake, ShieldCheck } from 'lucide-react';

const featureCards = [
  {
    title: 'Best of Nature',
    Icon: Leaf,
  },
  {
    title: 'No Toxins',
    Icon: FlaskConical,
  },
  {
    title: 'Cruelty Free',
    Icon: HeartHandshake,
  },
  {
    title: 'Safe & Certified',
    Icon: ShieldCheck,
  },
];

const FeaturesBanner = () => {
  return (
    <section className="bg-white py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {featureCards.map(({ title, Icon }) => (
            <div
              key={title}
              className="group rounded-2xl border border-[#e8dbc4] bg-[#fff7eb] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center px-4 py-5 sm:px-5 sm:py-6"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-logo-green/40 bg-white flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-105">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-logo-green" strokeWidth={1.8} />
              </div>
              <p className="font-semibold text-logo-green uppercase tracking-wide leading-snug text-[15px] max-[425px]:text-[16px] sm:text-sm md:text-base">
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
