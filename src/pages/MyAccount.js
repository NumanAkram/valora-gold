import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, LogOut, Edit, Home } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';

const MyAccount = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please sign in to access your account', 'error');
        navigate('/signin');
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response.success) {
          setUser(response.data);
        } else {
          showToast('Failed to load account information', 'error');
          navigate('/signin');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast('Please sign in to access your account', 'error');
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, showToast]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Signed out successfully!', 'success');
    navigate('/signin');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 font-sans">Loading account information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Home', path: '/' },
          { label: 'My Account', path: '/my-account' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-logo-green mb-2 font-sans uppercase tracking-wide">
            My Account
          </h1>
          <p className="text-gray-600 font-sans">
            Manage your account information and settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-sans flex items-center space-x-2">
                  <User className="h-5 w-5 text-logo-green" />
                  <span>Personal Information</span>
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 font-sans">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900 font-sans">{user.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 font-sans">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900 font-sans">{user.email || 'N/A'}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 font-sans">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900 font-sans">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <span className="text-gray-400 font-sans text-sm">Role</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-sans">Account Type</p>
                    <p className="text-lg font-semibold text-gray-900 font-sans capitalize">{user.role || 'User'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Addresses */}
            {user.addresses && Array.isArray(user.addresses) && user.addresses.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 font-sans flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-logo-green" />
                    <span>Shipping Addresses</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {user.addresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 font-sans mb-2">{address.street || 'N/A'}</p>
                          <p className="text-gray-600 font-sans text-sm">
                            {address.city || ''}, {address.province || ''} {address.postalCode || ''}
                          </p>
                          {address.phone && (
                            <p className="text-gray-600 font-sans text-sm mt-1">Phone: {address.phone}</p>
                          )}
                          {address.isDefault && (
                            <span className="inline-block mt-2 px-2 py-1 bg-logo-green text-white text-xs font-semibold rounded font-sans">
                              Default Address
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/order-history"
                  className="block w-full bg-logo-green text-white font-bold py-3 px-4 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans text-center"
                >
                  View Order History
                </Link>
                <Link
                  to="/track-order"
                  className="block w-full border border-logo-green text-logo-green font-bold py-3 px-4 rounded-lg hover:bg-logo-green hover:text-white transition-colors duration-300 font-sans text-center"
                >
                  Track My Order
                </Link>
                <Link
                  to="/wishlist"
                  className="block w-full border border-logo-green text-logo-green font-bold py-3 px-4 rounded-lg hover:bg-logo-green hover:text-white transition-colors duration-300 font-sans text-center"
                >
                  My Wishlist
                </Link>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans">Account Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300 font-sans flex items-center justify-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
                <Link
                  to="/"
                  className="block w-full bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 font-sans text-center flex items-center justify-center space-x-2"
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;

