import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import CartSidebar from './components/CartSidebar';
import WhatsAppButton from './components/WhatsAppButton';
import SocialMediaSidebar from './components/SocialMediaSidebar';
import SalesPopup from './components/SalesPopup';
import AdminRoute from './components/admin/AdminRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import SearchResults from './pages/SearchResults';
import OtherProducts from './pages/OtherProducts';
import HairCare from './pages/HairOil';
import Perfume from './pages/Perfume';
import BeautyProducts from './pages/BeautyProducts';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyAccount from './pages/MyAccount';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';
import ComingSoon from './pages/ComingSoon';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundCancellation from './pages/RefundCancellation';
import TermsConditions from './pages/TermsConditions';
import FAQs from './pages/FAQs';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminOrders from './admin/pages/AdminOrders';
import AdminUsers from './admin/pages/AdminUsers';
import AdminLogin from './admin/pages/AdminLogin';

const AppShell = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/other-products" element={<OtherProducts />} />
          <Route path="/other" element={<OtherProducts />} />
          <Route path="/hair-care" element={<HairCare />} />
          <Route path="/perfume" element={<Perfume />} />
          <Route path="/beauty-products" element={<BeautyProducts />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-cancellation" element={<RefundCancellation />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/faqs" element={<FAQs />} />
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

      {!isAdminRoute && (
        <>
          <Footer />
          <BackToTop />
          <WhatsAppButton />
          <SocialMediaSidebar />
          <SalesPopup />
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <RecentlyViewedProvider>
          <CartProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AdminAuthProvider>
                <ScrollToTop />
                <CartSidebar />
                <AppShell />
              </AdminAuthProvider>
            </Router>
          </CartProvider>
        </RecentlyViewedProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}

export default App;
