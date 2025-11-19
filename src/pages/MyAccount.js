import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Edit,
  Home,
  Image as ImageIcon,
  X as CloseIcon,
  Globe,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { authAPI, profileAPI, uploadAPI } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';
import countries from '../data/countries';
import { validatePhoneNumber } from '../utils/phoneValidation';

const MyAccount = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [countryQuery, setCountryQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    countryCode: '',
    phoneDialCode: '',
    profileImage: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    gender: '',
  });
  const [profilePreview, setProfilePreview] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const countryDropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response.success) {
          setUser(response.data);
        } else {
          showToast('Failed to load account information', 'error');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, showToast]);

  useEffect(() => {
    if (user && !isEditing) {
      // Only reset formData when not editing to preserve user's changes
      const matchedCountry =
        countries.find((country) =>
          user.countryCode ? country.code === user.countryCode : country.dial_code === user.phoneDialCode
        ) || countries[0];

      setSelectedCountry(matchedCountry);

      let phoneWithoutDial = user.phone || '';
      if (phoneWithoutDial.startsWith(matchedCountry.dial_code)) {
        phoneWithoutDial = phoneWithoutDial.replace(matchedCountry.dial_code, '');
      }
      phoneWithoutDial = phoneWithoutDial.replace(/^\+?/, '');

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: phoneWithoutDial,
        country: matchedCountry.name,
        countryCode: matchedCountry.code,
        phoneDialCode: matchedCountry.dial_code,
        profileImage: user.profileImage || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        gender: user.gender || '',
      });
      setProfilePreview(user.profileImage || '');
      setPhoneError('');
    }
  }, [user, isEditing]);

  useEffect(() => {
    const handler = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    
    // Re-validate phone number with new country code
    if (formData.phone.trim()) {
      const validation = validatePhoneNumber(formData.phone, country.dial_code);
      if (!validation.isValid) {
        setPhoneError(validation.error);
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9+\s()-]/g, '');
      setFormData((prev) => ({ ...prev, phone: cleaned }));
      
      // Real-time validation
      if (cleaned.trim() && selectedCountry) {
        const validation = validatePhoneNumber(cleaned, selectedCountry.dial_code);
        if (!validation.isValid) {
          setPhoneError(validation.error);
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfilePreview('');
      setFormData((prev) => ({ ...prev, profileImage: '' }));
      return;
    }

    // File validation
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, GIF, WebP, etc.).', 'error');
      event.target.value = '';
      return;
    }

    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast('Image size must be less than 10MB. Please compress the image and try again.', 'error');
      event.target.value = '';
      return;
    }

    setUploadingProfileImage(true);
    try {
      const response = await uploadAPI.uploadProfileImage(file);
      if (response.success && response.url) {
        const newImageUrl = response.url;
        // Update both preview and formData with the new image URL immediately
        setProfilePreview(newImageUrl);
        setFormData((prev) => {
          const updated = { ...prev, profileImage: newImageUrl };
          console.log('Profile image updated in formData:', newImageUrl);
          return updated;
        });
        showToast('Profile image uploaded successfully.', 'success');
      } else {
        throw new Error(response.message || 'Failed to upload image.');
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      let errorMessage = 'Failed to upload image.';
      if (error.message && error.message.includes('too large')) {
        errorMessage = 'Image file is too large. Please use an image smaller than 10MB.';
      } else if (error.message && error.message.includes('Only image files')) {
        errorMessage = 'Please select a valid image file (JPG, PNG, GIF, WebP, etc.).';
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setUploadingProfileImage(false);
      // Don't reset the input value so user can see the file was selected
      // event.target.value = '';
    }
  };

  const clearProfileImage = () => {
    setProfilePreview('');
    setFormData((prev) => ({ ...prev, profileImage: '' }));
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setPhoneError('');
    setIsSaving(true);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      setIsSaving(false);
      return;
    }

    // Validate phone number with country code
    if (formData.phone.trim()) {
      const phoneValidation = validatePhoneNumber(formData.phone, selectedCountry.dial_code);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error);
        setIsSaving(false);
        return;
      }
    }
    
    const numericPhone = formData.phone.replace(/\D/g, '');

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: numericPhone ? `${selectedCountry.dial_code}${numericPhone}` : '',
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      phoneDialCode: selectedCountry.dial_code,
      profileImage: formData.profileImage || '', // Always include profileImage, use formData which has latest uploaded image
      gender: formData.gender || undefined,
      currentPassword: formData.currentPassword || undefined,
      newPassword: formData.newPassword || undefined,
    };
    
    console.log('Saving profile with image URL:', payload.profileImage);

    try {
      const response = await profileAPI.update(payload);
      if (response.success) {
        // Update user state with new data
        setUser(response.data);
        // Update profilePreview with updated profileImage
        setProfilePreview(response.data.profileImage || '');
        // Update formData with latest profileImage
        setFormData((prev) => ({
          ...prev,
          profileImage: response.data.profileImage || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setIsEditing(false);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        window.dispatchEvent(new Event('valora-user-updated'));
        showToast('Account updated successfully', 'success');
      } else {
        showToast(response.message || 'Failed to update account', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update account', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-10 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 font-sans">You’re not signed in</h2>
            <p className="text-gray-600 font-sans">Sign in to view and manage your account details.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/signin')}
                className="px-6 py-3 bg-logo-green text-white font-bold rounded-lg hover:bg-banner-green transition-colors font-sans"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-logo-green text-logo-green font-bold rounded-lg hover:bg-logo-green hover:text-white transition-colors font-sans"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                <div className="flex items-center gap-3">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-logo-green text-white text-sm font-semibold rounded-lg hover:bg-banner-green transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  {user.profileImage && (
                    <div className="flex items-center space-x-3">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-logo-green/10 flex items-center justify-center">
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-sans">Profile Photo</p>
                        <p className="text-lg font-semibold text-gray-900 font-sans">Uploaded</p>
                      </div>
                    </div>
                  )}

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

                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 flex items-center justify-center">
                      <span className="text-gray-400 font-sans text-sm">Gender</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-sans">Gender</p>
                      <p className="text-lg font-semibold text-gray-900 font-sans capitalize">
                        {user.gender ? user.gender : 'Not specified'}
                      </p>
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

                  {(user.country || user.countryCode || user.phoneDialCode) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 font-sans">Country</p>
                        <p className="text-lg font-semibold text-gray-900 font-sans">
                          {user.country || 'N/A'}
                          {user.phoneDialCode && (
                            <span className="text-sm text-gray-500 font-sans ml-2">({user.phoneDialCode})</span>
                          )}
                        </p>
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
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full bg-logo-green/10 flex items-center justify-center text-logo-green font-semibold text-xl uppercase overflow-hidden">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                      ) : formData.name ? (
                        <span>{formData.name.trim().charAt(0).toUpperCase()}</span>
                      ) : (
                        <ImageIcon className="h-8 w-8 text-logo-green/70" />
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
                    <label className="flex items-center justify-center px-4 py-2 border border-logo-green text-logo-green rounded-lg cursor-pointer hover:bg-logo-green hover:text-white transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleProfileImageChange}
                        disabled={uploadingProfileImage || isSaving}
                      />
                      {uploadingProfileImage ? 'Uploading...' : 'Upload Photo'}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2 font-sans">Gender</span>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors font-sans text-sm font-semibold ${
                          formData.gender === 'male'
                            ? 'border-logo-green bg-logo-green/10 text-logo-green'
                            : 'border-gray-300 text-gray-700 hover:border-logo-green/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span>Male</span>
                      </label>
                      <label
                        className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors font-sans text-sm font-semibold ${
                          formData.gender === 'female'
                            ? 'border-logo-green bg-logo-green/10 text-logo-green'
                            : 'border-gray-300 text-gray-700 hover:border-logo-green/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>

                  <div ref={countryDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                      Country
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 border border-gray-300 rounded-lg text-left hover:border-logo-green focus:outline-none focus:ring-2 focus:ring-logo-green"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-700">
                        <Globe className="h-4 w-4 text-gray-500" />
                        {selectedCountry.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>
                    {isCountryDropdownOpen && (
                      <div className="absolute mt-2 inset-x-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                        <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={countryQuery}
                            onChange={(event) => setCountryQuery(event.target.value)}
                            placeholder="Search country"
                            className="w-full text-sm outline-none"
                          />
                        </div>
                        <ul className="max-h-56 overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <li
                              key={country.code}
                              onClick={() => handleSelectCountry(country)}
                              className="px-3 py-2 text-sm hover:bg-logo-green/10 cursor-pointer flex items-center justify-between"
                            >
                              <span>{country.name}</span>
                              <span className="text-gray-500">{country.dial_code}</span>
                            </li>
                          ))}
                          {filteredCountries.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-500">No countries found.</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                      Phone Number
                    </label>
                    <div className="flex">
                      <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-gray-500" />
                        {selectedCountry.dial_code}
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="appearance-none block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-r-lg placeholder-gray-400 focus:outline-none focus:ring-logo-green focus:border-logo-green text-sm"
                        placeholder={`e.g., ${selectedCountry.dial_code}123456789`}
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-600 font-sans">{phoneError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green text-sm"
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green text-sm"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-sans">
                    Leave the password fields blank if you don’t want to change your password.
                    Changing your password requires entering the current password for verification.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-logo-green text-white font-bold rounded-lg hover:bg-banner-green transition-colors disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        if (user) {
                          const matchedCountry =
                            countries.find((country) =>
                              user.countryCode ? country.code === user.countryCode : country.dial_code === user.phoneDialCode
                            ) || countries[0];
                          setSelectedCountry(matchedCountry);
                          let phoneWithoutDial = user.phone || '';
                          if (phoneWithoutDial.startsWith(matchedCountry.dial_code)) {
                            phoneWithoutDial = phoneWithoutDial.replace(matchedCountry.dial_code, '');
                          }
                          phoneWithoutDial = phoneWithoutDial.replace(/^\+?/, '');
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            phone: phoneWithoutDial,
                            country: matchedCountry.name,
                            countryCode: matchedCountry.code,
                            phoneDialCode: matchedCountry.dial_code,
                            profileImage: user.profileImage || '',
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                            gender: user.gender || '',
                          });
                          setProfilePreview(user.profileImage || '');
                          setPhoneError('');
                        }
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
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

