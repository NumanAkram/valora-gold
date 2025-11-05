import React from 'react';
import { Award, Users, Clock, Shield, Sparkles, Crown } from 'lucide-react';

const About = () => {
  const stats = [
    { number: "50+", label: "Years Experience", icon: Clock },
    { number: "10,000+", label: "Happy Customers", icon: Users },
    { number: "500+", label: "Awards Won", icon: Award },
    { number: "100%", label: "Satisfaction", icon: Shield }
  ];

  const features = [
    {
      icon: Crown,
      title: "Royal Heritage",
      description: "Three generations of goldsmithing expertise passed down through our family."
    },
    {
      icon: Sparkles,
      title: "Handcrafted Excellence",
      description: "Each piece is meticulously crafted by skilled artisans using traditional techniques."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "100% authentic gold with lifetime warranty and certification guarantee."
    }
  ];

  return (
    <section className="py-20 gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            About <span className="text-gradient">Valora Gold</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            For over five decades, we have been crafting exceptional gold jewelry that celebrates 
            life's most precious moments with timeless elegance and unmatched quality.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-gold-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gold-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                Our Story
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Founded in 1973 by Master Goldsmith Rajesh Kumar, Valora Gold began as a small 
                workshop in the heart of Mumbai. What started as a passion for creating beautiful 
                jewelry has grown into one of India's most trusted gold jewelry brands.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, under the leadership of his son and grandson, we continue to uphold the 
                same values of quality, craftsmanship, and customer satisfaction that have been 
                our foundation for over 50 years.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=700&fit=crop&crop=center"
                alt="Valora Gold Workshop"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="text-xl font-semibold mb-2">Master Craftsman at Work</h4>
                <p className="text-sm opacity-90">Creating timeless pieces with traditional techniques</p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-200 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gold-300 rounded-full opacity-30"></div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center bg-white/50 backdrop-blur-sm rounded-2xl p-12">
          <h3 className="text-3xl font-serif font-bold text-gray-900 mb-6">
            Our Mission
          </h3>
          <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            "To create exceptional gold jewelry that not only adorns but also tells stories, 
            celebrates moments, and becomes treasured heirlooms passed down through generations. 
            We believe that every piece of jewelry should be a work of art that reflects the 
            beauty and uniqueness of the person who wears it."
          </p>
          <div className="mt-8 text-lg font-semibold text-gold-600">
            — Rajesh Kumar, Founder & Master Goldsmith
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

