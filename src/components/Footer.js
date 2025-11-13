import React, { useState } from 'react';
import { Phone, Mail, Facebook, Instagram, MapPin, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

// WhatsApp Icon Component - Official WhatsApp Logo
const WhatsAppIcon = ({ className }) => (
  <svg 
    className={className}
    fill="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const Footer = () => {
  const [result, setResult] = useState('');
  const { showToast } = useToast();
  const handleScrollToTop = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult("Sending....");

    const formData = new FormData(e.target);
    formData.append("access_key", "80f58325-c145-42c0-9155-6b687b965a55");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      e.target.reset();
      showToast('Successfully subscribed to newsletter!', 'success');
    } else {
      setResult("Error");
      showToast('Subscription failed. Please try again.', 'error');
    }
  };

  return (
    <footer className="bg-banner-green text-white py-8 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          
          {/* Company Information Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
              <a
                href="#top"
                onClick={handleScrollToTop}
                className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60"
              >
                <img
                  src="/VG Logo.webp"
                  alt="Valora Gold"
                  className="w-full h-full object-cover rounded-full"
                />
              </a>
              <div className="flex flex-col justify-center">
                <span className="text-white font-extrabold text-lg sm:text-xl md:text-2xl leading-tight" style={{ letterSpacing: '2px', fontFamily: 'Poppins, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>VALORA</span>
                <span className="text-yellow-300 font-bold text-sm sm:text-base md:text-lg leading-tight mt-0.5 sm:mt-1" style={{ letterSpacing: '4px', fontFamily: 'Poppins, sans-serif', textShadow: '0 2px 4px rgba(255,215,0,0.3)' }}>GOLD</span>
              </div>
            </div>

            {/* About Text */}
            <p className="text-white text-sm leading-relaxed font-sans">
              Welcome to Valora Gold, your trusted destination for premium gold solutions. Our signature Valora Hair Oil is enriched with powerful botanicals that strengthen roots, reduce breakage, and revive shine with every use. Experience authentic, certified care crafted with exceptional quality and conscious luxury.
            </p>

            {/* Contact Details */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-white flex-shrink-0" />
                <a href="tel:03390005256" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  0339-0005256
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-white flex-shrink-0" />
                <a 
                  href="mailto:info@valoragold.store" 
                  className="text-white text-sm underline hover:text-gray-200 transition-colors font-sans"
                >
                  info@valoragold.store
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-white flex-shrink-0" />
                <span className="text-white text-sm font-sans">115-B Gulberg Phase II, Lahore, Pakistan</span>
              </div>
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-white flex-shrink-0" />
                <a 
                  href="https://valoragold.store" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white text-sm underline hover:text-gray-200 transition-colors font-sans flex items-center space-x-1"
                >
                  <span>valoragold.store</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="pt-4" />
          </div>

          {/* Categories Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              CATEGORIES
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/hair-care" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link to="/perfume" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Fragrance Collection
                </Link>
              </li>
              <li>
                <Link to="/beauty-products" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Beauty & Skin Care
                </Link>
              </li>
              <li>
                <Link to="/other" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Others
                </Link>
              </li>
            </ul>
          </div>

          {/* User Information Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              USER INFORMATION
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/my-account" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/order-history" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Track My Order
                </Link>
              </li>
            </ul>
          </div>

          {/* User Link Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              USER LINK
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy-policy" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/refund-cancellation" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Refund & Cancellation
                </a>
              </li>
              <li>
                <a href="/terms-conditions" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-white text-sm hover:text-gray-200 transition-colors font-sans">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="/faqs" className="text-white text-sm hover:text-gray-200 transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Sign Up & Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              NEWSLETTER SIGN UP
            </h3>
            <p className="text-white text-sm leading-relaxed">
              Sign up for exclusive updates, new arrivals & insider only discounts
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="enter your email"
                  className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-bold text-sm rounded-r-lg hover:bg-gray-100 transition-colors"
                >
                  SUBMIT
                </button>
              </div>
              {result && (
                <span className={`text-white text-xs block mt-1 ${result === 'Form Submitted Successfully' ? 'text-green-200' : result === 'Error' ? 'text-red-200' : 'text-white'}`}>
                  {result}
                </span>
              )}
            </form>

            {/* Social Media Icons */}
            <div className="space-y-3">
              <div>
                <p className="text-white text-sm font-semibold mb-2 font-sans">Follow Us</p>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="https://linktr.ee/valoragold" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="All Social Media Links"
                  >
                    <LinkIcon className="h-5 w-5 text-black" />
                  </a>
                  <a 
                    href="https://www.facebook.com/valoragold.pk/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                  <a 
                    href="https://www.instagram.com/valoragold/#" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                  <a 
                    href="https://www.whatsapp.com/channel/0029Vb6rKlPIXnlz8X1gBR1r"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    title="WhatsApp"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>
              <div>
                <a 
                  href="https://linktr.ee/valoragold" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm underline hover:text-gray-200 transition-colors font-sans flex items-center space-x-1"
                >
                  <span>View All Links</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-600 mt-12 pt-6">
          <p className="text-center text-white text-sm font-sans">
            Copyright © 2025 Valora Gold. All Rights Reserved. | 115-B Gulberg Phase II, Lahore, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

