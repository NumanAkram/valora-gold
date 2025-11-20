import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, ChevronDown, Leaf, X as CloseIcon, Heart, PlusCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CATEGORIES from '../constants/categories';
import AddProductModal from './AddProductModal';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getActiveUserRole } from '../utils/authHelper';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const { getCartItemsCount, openCartSidebar } = useCart();
  const { getWishlistCount } = useWishlist();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();

  const isLoggedIn = Boolean(userInfo) || isAdminAuthenticated;
  const isAdminUser = isAdminAuthenticated || (userInfo?.role && String(userInfo.role).toLowerCase() === 'admin');
  const accountLink = isLoggedIn ? (isAdminUser ? '/admin' : '/my-account') : '/signin';
  const accountName = userInfo?.name || userInfo?.email || (isAdminUser ? 'Admin' : 'My Account');
  const avatarUrl = userInfo?.profileImage;
  const avatarInitial = (accountName || 'V').trim().charAt(0).toUpperCase();

  const renderAvatar = (sizeClass = 'w-8 h-8', textClass = 'text-sm') => (
    <div className={`rounded-full overflow-hidden bg-logo-green/10 flex items-center justify-center text-logo-green font-semibold uppercase ${sizeClass}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <span className={textClass}>{avatarInitial}</span>
      )}
    </div>
  );

  const syncUserRole = useCallback(() => {
    try {
      const authInfo = getActiveUserRole();
      setUserRole(authInfo.role);
      setUserInfo(authInfo.userInfo);
    } catch (error) {
      console.error('Failed to determine user role', error);
      setUserRole(null);
      setUserInfo(null);
    }
  }, []);

  useEffect(() => {
    syncUserRole();
    const handleStorage = (event) => {
      if (event.key === 'user' || event.key === 'valora_admin' || event.key === 'token' || event.key === 'admin_token' || event.key === null) {
        syncUserRole();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('valora-user-updated', syncUserRole);
    window.addEventListener('admin-auth-changed', syncUserRole);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('valora-user-updated', syncUserRole);
      window.removeEventListener('admin-auth-changed', syncUserRole);
    };
  }, [syncUserRole]);

  useEffect(() => {
    syncUserRole();
  }, [syncUserRole, isAdminAuthenticated]);

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

  return (
    <div className="bg-white sticky top-0 z-[110] shadow-sm" id="top">
      {/* Top Promotional Banner */}
      {showBanner && (
        <div className="bg-banner-green text-white py-2 sm:py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-center relative px-3 sm:px-4">
            <div className="w-full flex items-center gap-3 sm:gap-4 pr-6">
              <div className="flex-1 overflow-hidden">
                <div className="marquee-container">
                  <div className="marquee-content text-[13px] sm:text-sm font-medium whitespace-nowrap">
                    <span className="px-4">
                      Cash on Delivery Available in all over the Pakistan 🚚 | Delivery in just 3–4 working days ⏱ | Enjoy free shipping on all orders above PKR 8,000 🎁 | Get an additional 5% discount on advance payment 💳
                    </span>
                    <span className="px-4">
                      Cash on Delivery Available in all over the Pakistan 🚚 | Delivery in just 3–4 working days ⏱ | Enjoy free shipping on all orders above PKR 8,000 🎁 | Get an additional 5% discount on advance payment 💳
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-semibold hover:underline"
                onClick={() => {
                  const target = document.getElementById('shop-by-category');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Shop Now</span>
              </button>
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
                <Link
                  to="/"
                  className="flex items-center space-x-1 sm:space-x-2 md:space-x-2"
                >
                  <div className="relative flex-shrink-0">
                    {/* Logo Container */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white flex items-center justify-center p-2 md:p-2.5">
                      <img
                        src="/VG Logo.webp"
                        alt="Valora Gold"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center flex-shrink-0">
                    <span className="text-gray-900 font-extrabold text-sm sm:text-base md:text-lg lg:text-xl leading-tight whitespace-nowrap text-center" style={{ letterSpacing: '2px', fontFamily: 'Poppins, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.12)' }}>VALORA</span>
                    <span className="text-yellow-600 font-bold text-xs sm:text-sm md:text-base lg:text-lg leading-tight mt-0.5 whitespace-nowrap text-center" style={{ letterSpacing: '4px', fontFamily: 'Poppins, sans-serif', textShadow: '0 1px 2px rgba(255,215,0,0.25)' }}>GOLD</span>
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
                {isLoggedIn ? (
                   <Link
                    to={accountLink}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-logo-green text-logo-green font-semibold hover:bg-logo-green hover:text-white transition-colors flex-shrink-0"
                  >
                    {renderAvatar('w-8 h-8', 'text-sm')}
                    <div className="hidden lg:flex flex-col text-left leading-tight">
                      <span className="text-sm font-semibold">My Account</span>
                      <span className="text-xs font-normal capitalize">{accountName}</span>
                    </div>
                  </Link>
                 ) : (
                  <Link to="/signin" className="hidden sm:flex items-center space-x-1 lg:space-x-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                    <User className="h-4 w-4 lg:h-5 lg:w-5 text-text-gray" />
                    <div className="hidden lg:flex flex-col whitespace-nowrap">
                      <span className="text-xs text-text-gray font-normal">Sign or Register in</span>
                      <span className="text-sm font-bold text-text-gray">My Account</span>
                    </div>
                  </Link>
                )}
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
              <Link to="/" className="flex items-center space-x-1 flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center p-2">
                    <img
                      src="/VG Logo.webp"
                      alt="Valora Gold"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center flex-shrink-0">
                  <span className="text-gray-900 font-extrabold text-base leading-tight whitespace-nowrap text-center" style={{ letterSpacing: '2px', fontFamily: 'Poppins, sans-serif' }}>VALORA</span>
                  <span className="text-yellow-600 font-bold text-sm leading-tight mt-0.5 whitespace-nowrap text-center" style={{ letterSpacing: '4px', fontFamily: 'Poppins, sans-serif' }}>GOLD</span>
                </div>
              </Link>

              {/* Icons - Right */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* User Icon */}
                {isLoggedIn ? (
                  <Link
                    to={accountLink}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-logo-green text-logo-green font-semibold hover:bg-logo-green hover:text-white transition-colors"
                  >
                    {renderAvatar('w-8 h-8', 'text-sm')}
                    <span className="text-sm">My Account</span>
                  </Link>
                ) : (
                  <Link to="/signin" className="flex items-center justify-center p-2 text-text-gray hover:text-logo-green transition-colors">
                    <User className="h-5 w-5" />
                  </Link>
                )}
                
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
              <Link to="/" className="flex items-center space-x-1 flex-shrink-0">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center p-2">
                    <img
                      src="/VG Logo.webp"
                      alt="Valora Gold"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center flex-shrink-0">
                  <span className="text-gray-900 font-extrabold text-[12px] leading-tight whitespace-nowrap text-center" style={{ letterSpacing: '1.5px', fontFamily: 'Poppins, sans-serif' }}>VALORA</span>
                  <span className="text-yellow-600 font-bold text-[10px] leading-tight mt-0.5 whitespace-nowrap text-center" style={{ letterSpacing: '3px', fontFamily: 'Poppins, sans-serif' }}>GOLD</span>
                </div>
              </Link>

              {/* Icons - Right */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link
                  to={accountLink}
                  className={`relative flex items-center justify-center transition-colors ${
                    isLoggedIn
                      ? 'rounded-full'
                      : 'p-1.5 text-text-gray hover:text-logo-green'
                  }`}
                >
                  {isLoggedIn ? renderAvatar('w-9 h-9', 'text-base') : <User className="h-4 w-4" />}
                </Link>
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
      </div>

      {/* Mobile/Tablet Menu - Shows for mobile and tablet (below 1024px) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-[105]">
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
            {CATEGORIES.map((category) => (
              <Link
                key={category.value}
                to={category.path}
                onClick={toggleMenu}
                className="block text-text-gray font-normal text-sm py-2 border-b border-gray-200"
              >
                {category.label}
              </Link>
            ))}
            <Link
              to={accountLink}
              onClick={toggleMenu}
              className="block text-logo-green font-semibold text-sm py-2"
            >
              {isLoggedIn ? 'My Account' : 'Sign In / Register'}
            </Link>
          </div>
        </div>
      )}
      {canManageProducts && (
        <AddProductModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          allowAccess={canManageProducts}
        />
      )}
    </div>
  );
};

export default Navbar;
