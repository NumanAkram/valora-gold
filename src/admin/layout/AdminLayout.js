import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { AdminNotificationProvider } from '../context/AdminNotificationContext';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <AdminNotificationProvider>
      <div className="min-h-screen bg-gray-50 flex relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar */}
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={closeMobileMenu}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <AdminHeader 
            onToggleSidebar={handleToggleSidebar}
            onToggleMobileMenu={handleToggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          <main className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 w-full">
            {children}
          </main>
        </div>
      </div>
    </AdminNotificationProvider>
  );
};

export default AdminLayout;

