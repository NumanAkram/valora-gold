import React, { useState } from 'react';
import { Phone, Mail, Facebook, Instagram, MapPin, Link as LinkIcon, ExternalLink, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [result, setResult] = useState('');
  const { showToast } = useToast();

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
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-white shadow-md border-2 border-white flex items-center justify-center p-1 sm:p-1.5">
                <img
                  src="/VG Logo.png"
                  alt="Valora Gold"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-white font-extrabold text-lg sm:text-xl md:text-2xl leading-tight" style={{ letterSpacing: '1px', fontFamily: 'Inter, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>VALORA</span>
                <span className="text-yellow-300 font-bold text-sm sm:text-base md:text-lg leading-tight mt-0.5 sm:mt-1" style={{ letterSpacing: '3px', fontFamily: 'Inter, sans-serif', textShadow: '0 2px 4px rgba(255,215,0,0.3)' }}>GOLD</span>
                <span className="text-gray-200 font-light text-[10px] sm:text-xs leading-tight mt-1 sm:mt-2 tracking-wider hidden sm:block" style={{ letterSpacing: '1px', fontFamily: 'Inter, sans-serif' }}>Premium Gold & Jewelry</span>
              </div>
            </div>

            {/* About Text */}
            <p className="text-white text-sm leading-relaxed font-sans">
              Welcome to Valora Gold, your trusted destination for premium gold jewelry and accessories. 
              We offer authentic, certified gold products with exceptional craftsmanship and quality assurance. 
              Experience luxury with Valora Gold!
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
                <span className="text-white text-sm font-sans">15-B Gulberg II, Lahore, Pakistan</span>
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
          </div>

          {/* Categories Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              CATEGORIES
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/skin-care" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Skin Care
                </a>
              </li>
              <li>
                <a href="/hair-care" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Hair Care
                </a>
              </li>
              <li>
                <a href="/body-care" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Body Care
                </a>
              </li>
              <li>
                <a href="/baby-care" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Baby Care
                </a>
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
                <a href="/my-account" className="text-white text-sm hover:text-gray-200 transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="/order-history" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Order History
                </a>
              </li>
              <li>
                <a href="/wishlist" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Wishlist
                </a>
              </li>
              <li>
                <a href="/track-order" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Track My Order
                </a>
              </li>
              <li>
                <a href="/latest-news" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Latest News
                </a>
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
                <a href="/shipping-policy" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/return-exchange" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Return And Exchange
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
                <a href="/feedback" className="text-white text-sm hover:text-gray-200 transition-colors">
                  Feedback
                </a>
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
                    href="https://linktr.ee/valoragold" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                  <a 
                    href="https://linktr.ee/valoragold" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                  <a 
                    href="https://wa.me/923390005256"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5 text-white" />
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
            Copyright © 2025 Valora Gold. All Rights Reserved. | 15-B Gulberg II, Lahore, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

