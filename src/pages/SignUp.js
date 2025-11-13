import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, LogOut, Image as ImageIcon, X as CloseIcon, Globe, Search, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';
import countries from '../data/countries';

const SignUp = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const defaultCountry = countries.find((country) => country.code === 'PK') || countries[0];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const getInitialFormState = (country = defaultCountry) => ({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
    country: country.name,
    countryCode: country.code,
    phoneDialCode: country.dial_code,
    gender: '',
  });

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [countryQuery, setCountryQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);
  const [formData, setFormData] = useState(getInitialFormState(defaultCountry));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        setUserInfo(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('valora-user-updated'));
    setIsLoggedIn(false);
    setUserInfo(null);
    showToast('Signed out successfully!', 'success');
    // Redirect to login page after sign out
    navigate('/signin');
    window.location.reload(); // Reload to update auth state
  };

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      const cleaned = e.target.value.replace(/[^0-9+\s()-]/g, '');
      setFormData((prev) => ({
        ...prev,
        phone: cleaned,
      }));
      setPhoneError('');
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfilePreview('');
      setFormData((prev) => ({ ...prev, profileImage: '' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setProfilePreview(result);
        setFormData((prev) => ({ ...prev, profileImage: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const clearProfileImage = () => {
    setProfilePreview('');
    setFormData((prev) => ({ ...prev, profileImage: '' }));
  };

  const filteredCountries = useMemo(() => {
    if (!countryQuery) return countries;
    return countries.filter((country) =>
      country.name.toLowerCase().includes(countryQuery.trim().toLowerCase())
    );
  }, [countryQuery]);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setFormData((prev) => ({
      ...prev,
      country: country.name,
      countryCode: country.code,
      phoneDialCode: country.dial_code,
    }));
    setIsCountryDropdownOpen(false);
    setCountryQuery('');
    setPhoneError('');
  };

  useEffect(() => {
    const handler = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPhoneError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      setError('Please select your gender');
      setLoading(false);
      return;
    }

    const numericPhone = formData.phone.replace(/\D/g, '');
    if (numericPhone.length < 6 || numericPhone.length > 14) {
      setPhoneError('Please enter a valid phone number for the selected country.');
      setLoading(false);
      return;
    }
    const parsedPhoneNumber = `${selectedCountry.dial_code}${numericPhone}`;

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: parsedPhoneNumber,
        password: formData.password,
        role: 'user',
        profileImage: formData.profileImage,
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        phoneDialCode: selectedCountry.dial_code,
        gender: formData.gender,
      });
      
      // Don't auto-login after registration, just redirect to login page
      showToast('Account created successfully! Please sign in.', 'success');
      setProfilePreview('');
      setSelectedCountry(defaultCountry);
      setFormData(getInitialFormState(defaultCountry));
      
      // Redirect to login page after registration
      setTimeout(() => {
        navigate('/signin');
      }, 500);
    } catch (err) {
      setError(err.message || 'Registration failed');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {isLoggedIn ? (
          // User is logged in - Show Sign Out UI
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-center">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-logo-green font-sans mb-4">
                You are Signed In
              </h2>
              {userInfo && (
                <div className="mb-6">
                  <p className="text-gray-700 font-sans text-lg mb-2">
                    <span className="font-semibold">Email:</span> {userInfo.email}
                  </p>
                  {userInfo.name && (
                    <p className="text-gray-700 font-sans text-lg">
                      <span className="font-semibold">Name:</span> {userInfo.name}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300 font-sans flex items-center justify-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
              
              <Link
                to="/"
                className="block w-full bg-logo-green text-white font-bold py-3 px-4 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans text-center"
              >
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          // User is not logged in - Show Sign Up Form
          <>
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-logo-green font-sans">
                  Create Your Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 font-sans">
                  Already have an account?{' '}
                  <Link to="/signin" className="font-medium text-logo-green hover:text-banner-green">
                    Sign in
                  </Link>
                </p>
              </div>

              <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-sans">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Profile Photo (optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-logo-green/10 flex items-center justify-center text-logo-green font-semibold text-lg uppercase overflow-hidden">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : formData.name ? (
                    <span>{formData.name.trim().charAt(0).toUpperCase()}</span>
                  ) : (
                    <ImageIcon className="h-6 w-6 text-logo-green/70" />
                  )}
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={clearProfileImage}
                      className="absolute -top-1 -right-1 bg-white text-gray-500 rounded-full p-0.5 shadow hover:text-gray-700"
                      aria-label="Remove profile photo"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <label className="flex items-center justify-center px-4 py-2 border border-logo-green text-logo-green rounded-lg cursor-pointer hover:bg-logo-green hover:text-white transition-colors text-sm font-semibold">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                  Upload Photo
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 font-sans">Supported formats: JPG, PNG. Max size 5MB.</p>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Gender
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors font-sans text-sm font-semibold ${formData.gender === 'male' ? 'border-logo-green bg-logo-green/10 text-logo-green' : 'border-gray-300 text-gray-700 hover:border-logo-green/60'}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span>Male</span>
                </label>
                <label className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors font-sans text-sm font-semibold ${formData.gender === 'female' ? 'border-logo-green bg-logo-green/10 text-logo-green' : 'border-gray-300 text-gray-700 hover:border-logo-green/60'}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Phone Number
              </label>
              <div className="flex">
                <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm text-gray-700">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {selectedCountry.dial_code}
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-r-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder={`e.g., ${selectedCountry.dial_code}123456789`}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 font-sans">
                Enter your number without the leading zero; we’ll prepend the {selectedCountry.dial_code} dial code automatically.
              </p>
              {phoneError && (
                <p className="mt-1 text-xs text-red-600 font-sans">{phoneError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green sm:text-sm font-sans"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-logo-green text-white font-bold py-3 px-4 rounded-lg hover:bg-banner-green transition-colors duration-300 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Creating Account...'
                : 'Create Account'}
            </button>
          </div>
        </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;
