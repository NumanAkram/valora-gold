import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import WhatsAppButton from './components/WhatsAppButton';
import SocialMediaSidebar from './components/SocialMediaSidebar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import SearchResults from './pages/SearchResults';
import OtherProducts from './pages/OtherProducts';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <RecentlyViewedProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/other-products" element={<OtherProducts />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                    <Route path="/offers" element={<ComingSoon />} />
                    <Route path="/face" element={<ComingSoon />} />
                    <Route path="/hair" element={<ComingSoon />} />
                    <Route path="/body" element={<ComingSoon />} />
                    <Route path="/baby-care" element={<ComingSoon />} />
                    <Route path="/shop-all" element={<ComingSoon />} />
                    <Route path="/by-ingredients" element={<ComingSoon />} />
                    <Route path="/by-concerns" element={<ComingSoon />} />
                    <Route path="*" element={<ComingSoon />} />
                  </Routes>
                </main>
                <Footer />
                <BackToTop />
                <WhatsAppButton />
                <SocialMediaSidebar />
              </div>
            </Router>
          </CartProvider>
        </RecentlyViewedProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}

export default App;
