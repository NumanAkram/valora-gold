import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, ChevronDown, Leaf, X as CloseIcon, Heart, PlusCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CATEGORIES from '../constants/categories';
import AddProductModal from './AddProductModal';
import { useAdminAuth } from '../context/AdminAuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { getCartItemsCount, openCartSidebar } = useCart();
  const { getWishlistCount } = useWishlist();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();

  const syncUserRole = useCallback(() => {
    try {
      let resolvedRole = null;

      const adminData = localStorage.getItem('valora_admin');
      if (adminData) {
        try {
          const parsedAdmin = JSON.parse(adminData);
          if (parsedAdmin?.role) {
            resolvedRole = String(parsedAdmin.role).toLowerCase();
          }
        } catch (error) {
          console.error('Failed to parse stored admin data', error);
        }
      }

      if (!resolvedRole) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.role) {
              resolvedRole = String(parsedUser.role).toLowerCase();
            }
          } catch (error) {
            console.error('Failed to parse stored user', error);
          }
        }
      }

      setUserRole(resolvedRole);
    } catch (error) {
      console.error('Failed to determine user role', error);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    syncUserRole();
    const handleStorage = (event) => {
      if (event.key === 'user' || event.key === null) {
        syncUserRole();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('valora-user-updated', syncUserRole);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('valora-user-updated', syncUserRole);
    };
  }, [syncUserRole]);

  const canManageProducts = Boolean(
    isAdminAuthenticated || (userRole && userRole.toLowerCase() === 'admin')
  );

  useEffect(() => {
    if (!canManageProducts && isAddModalOpen) {
      setIsAddModalOpen(false);
    }
  }, [canManageProducts, isAddModalOpen]);

  const canManageProductsRef = useRef(false);
  useEffect(() => {
    canManageProductsRef.current = canManageProducts;
  }, [canManageProducts]);

  useEffect(() => {
    const handleAddProductOpen = () => {
      if (canManageProductsRef.current) {
        setIsAddModalOpen(true);
      }
    };

    window.addEventListener('admin-add-product-open', handleAddProductOpen);
    return () => window.removeEventListener('admin-add-product-open', handleAddProductOpen);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show sticky navbar when scrolling down (after threshold)
      if (currentScrollY > 150) {
        // Scrolling down - show sticky navbar with slide-down animation
        if (currentScrollY > lastScrollY) {
          setIsScrolledDown(true);
        } 
        // Scrolling up - keep sticky navbar visible
        else if (currentScrollY < lastScrollY) {
          setIsScrolledDown(true);
        }
      } else {
        // At the top, hide sticky navbar (normal navbar will be visible)
        setIsScrolledDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="bg-white">
      {/* Top Promotional Banner */}
      {showBanner && (
        <div className="bg-banner-green text-white py-2 sm:py-2.5 px-2 sm:px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center relative">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-4 text-center">
              <span className="text-xs sm:text-sm font-medium px-2">
                Valora Gold | Cash on Delivery Available
              </span>
              <span className="hidden md:inline">|</span>
              <span className="text-xs sm:text-sm font-medium px-2 hidden sm:inline">
                Visit us at 15-B Gulberg II, Lahore
              </span>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium hover:underline cursor-pointer">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Shop Now</span>
              </div>
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute right-2 sm:right-4 text-white hover:text-gray-200 transition-colors"
            >
              <CloseIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Normal Navbar - Always Visible */}
      <div className="bg-white">
        {/* Main Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            {/* Desktop View - Above 1024px (lg) */}
            <div className="hidden lg:flex items-center justify-between h-16 sm:h-18 md:h-20 min-h-[64px] sm:min-h-[72px] md:min-h-[80px]">
              {/* Logo */}
              <div className="flex-shrink-0 max-w-[40%] sm:max-w-none">
                <Link to="/" className="flex items-center space-x-2 sm:space-x-2.5 md:space-x-3">
                  <div className="relative flex-shrink-0">
                    {/* Circular Logo Container - Fixed Size */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-white shadow-md border-2 border-yellow-500 flex items-center justify-center p-1">
                      <img
                        src="/VG Logo.png"
                        alt="Valora Gold"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center flex-shrink-0">
                    <span className="text-gray-900 font-extrabold text-xs sm:text-sm md:text-base lg:text-lg leading-tight whitespace-nowrap text-center" style={{ letterSpacing: '2px', fontFamily: 'Inter, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>VALORA</span>
                    <span className="text-yellow-600 font-bold text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight mt-0.5 whitespace-nowrap text-center" style={{ letterSpacing: '4px', fontFamily: 'Inter, sans-serif', textShadow: '0 1px 2px rgba(255,215,0,0.2)' }}>GOLD</span>
                  </div>
                </Link>
              </div>

              {/* Search Bar - Hidden on tablet (768px), shown on desktop (1024px+) */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-2 lg:mx-4 flex-shrink min-w-0">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the store"
                    className="w-full py-2 px-3 lg:py-2.5 lg:px-4 pr-10 lg:pr-12 bg-search-gray rounded-lg text-text-gray placeholder-gray-500 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent font-sans"
                  />
                  <button type="submit" className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity">
                    <Search className="h-3 w-3 lg:h-4 lg:w-4 text-text-gray" />
                  </button>
                </form>
              </div>

              {/* User Actions - Desktop */}
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
                {/* Wishlist */}
                <Link to="/wishlist" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                  <div className="relative">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-text-gray" />
                    <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] flex items-center justify-center px-0.5 sm:px-1 font-semibold">
                      {getWishlistCount()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-xs text-text-gray mt-0.5 sm:mt-1 font-normal whitespace-nowrap">Wishlist</span>
                </Link>

                {/* Shopping Cart */}
                <button
                  type="button"
                  onClick={openCartSidebar}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  <div className="relative">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-text-gray" />
                    <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-banner-green text-white text-[10px] sm:text-xs rounded-full min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] flex items-center justify-center px-0.5 sm:px-1 font-semibold">
                      {getCartItemsCount()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-xs text-text-gray mt-0.5 sm:mt-1 font-normal whitespace-nowrap">Cart</span>
                </button>

                {/* My Account */}
                <Link to="/signin" className="hidden sm:flex items-center space-x-1 lg:space-x-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                  <User className="h-4 w-4 lg:h-5 lg:w-5 text-text-gray" />
                  <div className="hidden lg:flex flex-col whitespace-nowrap">
                    <span className="text-xs text-text-gray font-normal">Sign or Register in</span>
                    <span className="text-sm font-bold text-text-gray">My Account</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Tablet View - 768px (md) to 1023px */}
            <div className="hidden md:flex lg:hidden items-center justify-between h-16 min-h-[64px]">
              {/* Hamburger Menu - Left */}
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center p-2 text-text-gray hover:text-logo-green transition-colors flex-shrink-0"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logo - Center */}
              <Link to="/" className="flex items-center space-x-2 flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-md border-2 border-yellow-500 flex items-center justify-center p-1">
                    <img
                      src="/VG Logo.png"
                      alt="Valora Gold"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center flex-shrink-0">
                  <span className="text-gray-900 font-extrabold text-sm leading-tight whitespace-nowrap text-center" style={{ letterSpacing: '2px', fontFamily: 'Inter, sans-serif' }}>VALORA</span>
                  <span className="text-yellow-600 font-bold text-xs leading-tight mt-0.5 whitespace-nowrap text-center" style={{ letterSpacing: '4px', fontFamily: 'Inter, sans-serif' }}>GOLD</span>
                </div>
              </Link>

              {/* Icons - Right */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* User Icon */}
                <Link to="/signin" className="flex items-center justify-center p-2 text-text-gray hover:text-logo-green transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                
                {/* Cart Icon */}
                <button
                  type="button"
                  onClick={openCartSidebar}
                  className="relative flex items-center justify-center p-2 text-text-gray hover:text-logo-green transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute top-0.5 right-0.5 bg-banner-green text-white text-[10px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 font-semibold">
                    {getCartItemsCount()}
                  </span>
                </button>

                {/* Search Icon */}
                <button 
                  onClick={() => navigate('/search')}
                  className="flex items-center justify-center p-2 text-text-gray hover:text-logo-green transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile View - Below 768px (0px to 767px) */}
            <div className="flex md:hidden items-center justify-between h-16 min-h-[64px]">
              {/* Hamburger Menu - Left */}
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center p-1.5 text-text-gray hover:text-logo-green transition-colors flex-shrink-0"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Logo - Center */}
              <Link to="/" className="flex items-center space-x-1.5 flex-shrink-0">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-md border-2 border-yellow-500 flex items-center justify-center p-0.5">
                    <img
                      src="/VG Logo.png"
                      alt="Valora Gold"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center flex-shrink-0">
                  <span className="text-gray-900 font-extrabold text-[10px] leading-tight whitespace-nowrap text-center" style={{ letterSpacing: '1px', fontFamily: 'Inter, sans-serif' }}>VALORA</span>
                  <span className="text-yellow-600 font-bold text-[8px] leading-tight mt-0.5 whitespace-nowrap text-center" style={{ letterSpacing: '2px', fontFamily: 'Inter, sans-serif' }}>GOLD</span>
                </div>
              </Link>

              {/* Icons - Right */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link to="/wishlist" className="relative flex items-center justify-center p-1.5 text-text-gray hover:text-logo-green transition-colors">
                  <Heart className="h-4 w-4" />
                  {getWishlistCount() > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] rounded-full min-w-[12px] h-[12px] flex items-center justify-center px-0.5 font-semibold">
                      {getWishlistCount()}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={openCartSidebar}
                  className="relative flex items-center justify-center p-1.5 text-text-gray hover:text-logo-green transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {getCartItemsCount() > 0 && (
                    <span className="absolute top-0 right-0 bg-banner-green text-white text-[8px] rounded-full min-w-[12px] h-[12px] flex items-center justify-center px-0.5 font-semibold">
                      {getCartItemsCount()}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => navigate('/search')}
                  className="flex items-center justify-center p-1.5 text-text-gray hover:text-logo-green transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar - Hidden on mobile and tablet, shown on desktop (1024px+) */}
        <div className="bg-white border-b border-gray-200 hidden lg:block">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <nav className="flex items-center justify-start flex-wrap gap-2 lg:gap-4 xl:gap-6 py-2 lg:py-3 md:pl-[calc(4rem+1rem+0.5rem)] lg:pl-[calc(4rem+1.5rem+1rem)]">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  to={category.path}
                  className="relative text-text-gray font-normal text-xs lg:text-sm hover:text-logo-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-logo-green after:w-0 hover:after:w-full after:transition-all after:duration-300 px-1"
                >
                  {category.label}
                </Link>
              ))}
              {canManageProducts && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="ml-4 inline-flex items-center gap-1 rounded-full border border-logo-green/30 bg-logo-green/10 px-3 py-1.5 text-xs font-semibold text-logo-green hover:bg-logo-green hover:text-white transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Product
                </button>
              )}
            </nav>
        </div>
      </div>

      {/* Sticky Navbar - Appears when scrolling down - Desktop only (1024px+) */}
      <div 
        className={`hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-transform duration-500 ease-in-out ${
          isScrolledDown ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Main Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 min-h-[64px] sm:min-h-[72px] md:min-h-[80px]">
              {/* Logo */}
              <div className="flex-shrink-0 max-w-[40%] sm:max-w-none">
                <Link to="/" className="flex items-center space-x-2 sm:space-x-2.5 md:space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-white shadow-md border-2 border-yellow-500 flex items-center justify-center p-1">
                      <img
                        src="/VG Logo.png"
                        alt="Valora Gold"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center flex-shrink-0">
                    <span className="text-gray-900 font-extrabold text-xs sm:text-sm md:text-base lg:text-lg leading-tight whitespace-nowrap text-center" style={{ letterSpacing: '2px', fontFamily: 'Inter, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>VALORA</span>
                    <span className="text-yellow-600 font-bold text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight mt-0.5 whitespace-nowrap text-center" style={{ letterSpacing: '4px', fontFamily: 'Inter, sans-serif', textShadow: '0 1px 2px rgba(255,215,0,0.2)' }}>GOLD</span>
                  </div>
                </Link>
              </div>

              {/* Search Bar - Desktop only */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-2 lg:mx-4 flex-shrink min-w-0">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the store"
                    className="w-full py-2 px-3 lg:py-2.5 lg:px-4 pr-10 lg:pr-12 bg-search-gray rounded-lg text-text-gray placeholder-gray-500 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent font-sans"
                  />
                  <button type="submit" className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity">
                    <Search className="h-3 w-3 lg:h-4 lg:w-4 text-text-gray" />
                  </button>
                </form>
              </div>

              {/* User Actions - Desktop */}
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
                <Link to="/wishlist" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                  <div className="relative">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-text-gray" />
                    <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] flex items-center justify-center px-0.5 sm:px-1 font-semibold">
                      {getWishlistCount()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-xs text-text-gray mt-0.5 sm:mt-1 font-normal whitespace-nowrap">Wishlist</span>
                </Link>

                <button
                  type="button"
                  onClick={openCartSidebar}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  <div className="relative">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-text-gray" />
                    <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-banner-green text-white text-[10px] sm:text-xs rounded-full min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] flex items-center justify-center px-0.5 sm:px-1 font-semibold">
                      {getCartItemsCount()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-xs text-text-gray mt-0.5 sm:mt-1 font-normal whitespace-nowrap">Cart</span>
                </button>

                <Link to="/signin" className="hidden sm:flex items-center space-x-1 lg:space-x-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                  <User className="h-4 w-4 lg:h-5 lg:w-5 text-text-gray" />
                  <div className="hidden lg:flex flex-col whitespace-nowrap">
                    <span className="text-xs text-text-gray font-normal">Sign or Register in</span>
                    <span className="text-sm font-bold text-text-gray">My Account</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar - Hidden on mobile and tablet, shown on desktop (1024px+) */}
        <div className="bg-white border-b border-gray-200 hidden lg:block">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <nav className="flex items-center justify-start flex-wrap gap-2 lg:gap-4 xl:gap-6 py-2 lg:py-3 lg:pl-[calc(4rem+1.5rem+1rem)]">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  to={category.path}
                  className="relative text-text-gray font-normal text-xs lg:text-sm hover:text-logo-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-logo-green after:w-0 hover:after:w-full after:transition-all after:duration-300 px-1"
                >
                  {category.label}
                </Link>
              ))}
              {canManageProducts && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="ml-4 inline-flex items-center gap-1 rounded-full border border-logo-green/30 bg-logo-green/10 px-3 py-1.5 text-xs font-semibold text-logo-green hover:bg-logo-green hover:text-white transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Product
                </button>
              )}
            </nav>
        </div>
      </div>
      </div>
      </div>

      {/* Mobile/Tablet Menu - Shows for mobile and tablet (below 1024px) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the store"
                  className="w-full py-2.5 px-4 pr-12 bg-search-gray rounded-lg text-text-gray placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent font-sans"
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity">
                  <Search className="h-4 w-4 text-text-gray" />
                </button>
              </div>
            </form>
            
            {/* Mobile Navigation Links */}
            <Link
              to="/hair-care"
              onClick={toggleMenu}
              className="block text-text-gray font-normal text-sm py-2 border-b border-gray-200"
            >
              Hair Care
            </Link>
            <Link
              to="/perfume"
              onClick={toggleMenu}
              className="block text-text-gray font-normal text-sm py-2 border-b border-gray-200"
            >
              Perfume
            </Link>
            <Link
              to="/beauty-products"
              onClick={toggleMenu}
              className="block text-text-gray font-normal text-sm py-2 border-b border-gray-200"
            >
              Beauty Products
            </Link>
            <Link
              to="/other"
              onClick={toggleMenu}
              className="block text-text-gray font-normal text-sm py-2 border-b border-gray-200"
            >
              other
            </Link>
            <Link
              to="/signin"
              onClick={toggleMenu}
              className="block text-logo-green font-semibold text-sm py-2"
            >
              My Account
            </Link>
          </div>
        </div>
      )}
      {canManageProducts && (
        <AddProductModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

export default Navbar;
