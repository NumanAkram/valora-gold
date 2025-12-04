import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, ChevronLeft, Plus, Minus, ShoppingCart, Heart, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedProducts from '../components/RelatedProducts';
import SetPriceModal from '../components/SetPriceModal';
import { productsAPI, reviewsAPI } from '../utils/api';
import { getDisplayRating } from '../utils/ratings';
import { getActiveUserRole } from '../utils/authHelper';

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  // Start on description by default
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBeingEdited, setReviewBeingEdited] = useState(null);
  const [questionForm, setQuestionForm] = useState({ name: '', email: '', message: '' });
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, reviewText: '' });
  const errorShownRef = useRef(false); // Track if error has been shown
  const fetchingRef = useRef(false); // Track if currently fetching
  const [priceProduct, setPriceProduct] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const location = useLocation();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  
  // Check user role from localStorage
  useEffect(() => {
    const syncUserRole = () => {
      try {
        const authInfo = getActiveUserRole();
        setUserRole(authInfo.role);
        setHasAdminAccess(authInfo.isAdmin || isAdminAuthenticated);
      } catch (error) {
        console.error('Failed to determine user role', error);
        setUserRole(null);
        setHasAdminAccess(false);
      }
    };

    syncUserRole();

    const handleStorage = (event) => {
      if (
        event.key === 'user' ||
        event.key === 'valora_admin' ||
        event.key === 'token' ||
        event.key === 'admin_token' ||
        event.key === null
      ) {
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
  }, [isAdminAuthenticated]);

  // Check if user is admin (either through admin login or regular login with admin role)
  const isAdmin = hasAdminAccess || (userRole && userRole.toLowerCase() === 'admin');

  const openPriceModal = (product) => {
    setPriceProduct(product);
    setIsPriceModalOpen(true);
  };

  const handlePriceUpdated = (updatedProduct) => {
    if (product && (product._id === updatedProduct._id || product.id === updatedProduct.id)) {
      setProduct({ ...product, ...updatedProduct });
    }
  };


  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts
    
    // Reset error flag when id changes
    errorShownRef.current = false;
    fetchingRef.current = false;
    
    const fetchProduct = async () => {
      if (!id || fetchingRef.current) return; // Prevent multiple simultaneous calls
      
      fetchingRef.current = true;
      
      // FIRST: Check for product in navigation state - this is always available
      const stateProduct = location && location.state && location.state.product;
      
      if (stateProduct) {
        // If we have product from state, use it immediately - no loading needed
        if (isMounted) {
          setProduct(stateProduct);
          addToRecentlyViewed(stateProduct);
          setLoading(false);
          fetchingRef.current = false;
        }
        
        // Still try to fetch reviews in background (optional)
        try {
          const reviewsResponse = await reviewsAPI.getByProduct(id);
          if (reviewsResponse && reviewsResponse.success && reviewsResponse.data && isMounted) {
            setReviews(reviewsResponse.data);
          }
        } catch (reviewError) {
          console.log('Reviews not available:', reviewError);
          // Don't show error for reviews, just use empty array
        }
        return; // Exit early - we have the product!
      }
      
      // If no state product, try to fetch from API
      try {
        setLoading(true);
        const response = await productsAPI.getById(id);
        
        if (!isMounted) return; // Check if component is still mounted
        
        if (response && response.success && response.data) {
          const productData = response.data;
          if (isMounted) {
            setProduct(productData);
            addToRecentlyViewed(productData);
            errorShownRef.current = false; // Reset error flag on success
          }
          
          // Fetch reviews (optional, don't fail if this fails)
          try {
            const reviewsResponse = await reviewsAPI.getByProduct(id);
            if (reviewsResponse && reviewsResponse.success && reviewsResponse.data && isMounted) {
              setReviews(reviewsResponse.data);
            }
          } catch (reviewError) {
            console.log('Reviews not available:', reviewError);
            // Don't show error for reviews, just use empty array
          }
        } else {
          // Only show error if we don't have state product AND API fails
          console.error('Product not found in API response');
          if (isMounted) {
            setProduct(null);
            // Only show toast once per product load
            if (!errorShownRef.current) {
              errorShownRef.current = true;
              showToast('Product not found. Please try again.', 'error');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        
        if (!isMounted) return;
        
        // Only show error if we don't have a product from state
        if (!errorShownRef.current) {
          errorShownRef.current = true;
          
          // Check if it's a network error or API error
          const errorMessage = error.message || '';
          if (errorMessage.includes('Failed to fetch') || errorMessage.includes('connect to server')) {
            showToast('Unable to connect to server. Please check if backend is running.', 'error');
          } else {
            showToast('Error loading product details', 'error');
          }
        }
        
        // Only set product to null if we don't have state product
        if (!stateProduct) {
          if (isMounted) {
            setProduct(null);
          }
        }
      } finally {
        if (isMounted && !stateProduct) {
          // Only set loading false if we didn't already set it for state product
          setLoading(false);
        }
        fetchingRef.current = false;
      }
    };
    
    fetchProduct();

    
    // Cleanup function
    return () => {
      isMounted = false;
      fetchingRef.current = false;
    };
  }, [id, location]); // Depend on id and location to catch state changes

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 font-sans">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 font-sans">Product Not Found</h1>
            <p className="text-gray-600 font-sans">The product you're looking for doesn't exist or couldn't be loaded.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-logo-green text-white px-6 py-3 rounded-lg hover:bg-banner-green transition-colors font-sans font-medium"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format product data
  const productId = product._id || product.id;
  const productName = product.name;
  const productPrice = product.price || 0;
  const productOriginalPrice = product.originalPrice || null;
  // Priority: imageUrl (primary) first, then gallery images
  const productImages = product.imageUrl 
    ? [product.imageUrl, ...(product.images || []).filter(img => img !== product.imageUrl && img)]
    : (product.images && product.images.length > 0 ? product.images : ['/4.webp']);
  const productDescription = product.description || '';
  const productIngredients = product.ingredients || '';
  const productBenefits = product.benefits || [];

  // Helper function to format description with proper paragraphs, lists, and alignment
  const formatDescription = (text) => {
    if (!text) return null;
    
    // Normalize the text - replace different bullet characters with standard ones
    let normalizedText = text
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '•') // Various bullet chars to •
      .replace(/^[\s]*[-]\s+/gm, '• ') // Dashes at line start to bullets
      .replace(/^[\s]*[\*]\s+/gm, '• ') // Asterisks at line start to bullets
      .replace(/^[\s]*[+]\s+/gm, '• '); // Plus signs at line start to bullets
    
    // Split by double newlines (paragraphs)
    const paragraphs = normalizedText.split(/\n\s*\n/).filter(p => p.trim());
    
    if (paragraphs.length === 0) return null;
    
    return paragraphs.map((para, paraIndex) => {
      const trimmedPara = para.trim();
      const lines = trimmedPara.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) return null;
      
      // Check if this paragraph contains bullet points
      const bulletPattern = /^[\s]*[•]\s+/;
      const hasBullets = lines.some(line => bulletPattern.test(line));
      
      // If it has bullets, render as a list (even if mixed with regular text)
      if (hasBullets) {
        return (
          <ul key={paraIndex} className="space-y-2 my-4 list-none">
            {lines.map((line, lineIndex) => {
              if (bulletPattern.test(line)) {
                // Extract bullet and content
                const content = line.replace(bulletPattern, '').trim();
                return (
                  <li key={lineIndex} className="flex items-start space-x-3">
                    <span className="text-[#D4AF37] font-bold text-lg mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 leading-relaxed font-sans text-justify flex-1">{content}</span>
                  </li>
                );
              } else if (line.trim()) {
                // Regular text line within a list context
                return (
                  <li key={lineIndex} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-4"></span>
                    <span className="text-gray-700 leading-relaxed font-sans text-justify flex-1">{line}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        );
      }
      
      // Regular paragraph with text-justify
      // Join lines with spaces if they're part of the same paragraph
      const paragraphText = lines.join(' ');
      return (
        <p key={paraIndex} className="text-gray-700 leading-relaxed font-sans text-justify mb-4">
          {paragraphText}
        </p>
      );
    });
  };
  // Calculate rating: Use real reviews if available, otherwise use fallback rating (same as product cards)
  const productRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length
    : getDisplayRating(product); // Fallback rating (4 or 5 stars) like product cards
  const productReviewsCount = reviews.length; // Only count real reviews from database
  const isComingSoon = Boolean(product.comingSoon) || productPrice === null;
  const isOutOfStock = Boolean(product.outOfStock) || (!product.inStock && product.stockCount === 0);
  const productInStock = !isComingSoon && !isOutOfStock && product.inStock !== false;
  const productStockCount = product.stockCount || 0;
  const displayReviews = reviews; // Only show real reviews, no fake/seed reviews
  const isEditingReview = Boolean(reviewBeingEdited && (reviewBeingEdited._id || reviewBeingEdited.id));

  const handleWishlist = () => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      showToast('Removed from wishlist', 'success');
    } else {
      addToWishlist({ ...product, id: productId });
      showToast('Added to wishlist!', 'success');
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing product: ${productName}`;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank');
  };

  const handleAddToCart = () => {
    if (!productInStock) {
      showToast('Product is out of stock', 'error');
      return;
    }
    
    const cartProduct = {
      ...product,
      id: productId,
      price: productPrice,
      images: productImages,
      image: productImages[0]
    };
    
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }
    showToast(`${quantity} item(s) added to cart!`, 'success');
    navigate('/cart');
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleBuyNow = () => {
    if (!productInStock) {
      showToast('Product is out of stock', 'error');
      return;
    }

    navigate('/checkout', {
      state: {
        buyNowProduct: {
      ...product,
      id: productId,
      price: productPrice,
      images: productImages,
          image: productImages[0],
          quantity,
        },
      },
    });
  };

  const submitQuestion = async () => {
    if (!questionForm.name || !questionForm.email || !questionForm.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("access_key", "afa4d0ff-1965-4b0b-8d2f-928c81664de8");
      formData.append("name", questionForm.name);
      formData.append("email", questionForm.email);
      formData.append("subject", `Product Question: ${productName}`);
      formData.append("message", `${questionForm.message}\n\nProduct: ${productName} (${productId})`);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Question sent! We will reply soon.', 'success');
        setShowAskModal(false);
        setQuestionForm({ name: '', email: '', message: '' });
      } else {
        showToast('Failed to send question. Please try again.', 'error');
      }
    } catch (e) {
      showToast('Failed to send question. Please try again.', 'error');
    }
  };

  const openCreateReviewModal = () => {
    setReviewBeingEdited(null);
    setReviewForm({ name: '', rating: 5, reviewText: '' });
    setShowReviewModal(true);
  };

  const startEditingReview = (review) => {
    setReviewBeingEdited(review);
    setReviewForm({
      name: review.customerName || '',
      rating: Number(review.rating) || 5,
      reviewText: review.reviewText || '',
    });
    setShowReviewModal(true);
  };

  const refreshProductStats = async () => {
    try {
      const updatedProductRes = await productsAPI.getById(productId);
      if (updatedProductRes?.success && updatedProductRes?.data) {
        setProduct(updatedProductRes.data);
        return true;
      }
    } catch (refreshError) {
      // fall through to optimistic update
    }
    return false;
  };

  const submitReview = async () => {
    if (!reviewForm.name || !reviewForm.name.trim()) {
      showToast('Please enter your name.', 'error');
      return;
    }

    if (!reviewForm.reviewText || !reviewForm.reviewText.trim()) {
      showToast('Please enter your review text.', 'error');
      return;
    }

    const payload = {
      customerName: reviewForm.name.trim(),
      rating: Number(reviewForm.rating),
      reviewText: reviewForm.reviewText.trim(),
    };

    try {
      if (reviewBeingEdited && (reviewBeingEdited._id || reviewBeingEdited.id)) {
        const reviewId = reviewBeingEdited._id || reviewBeingEdited.id;
        await reviewsAPI.update(reviewId, payload);
        showToast('Review updated!', 'success');
      } else {
      await reviewsAPI.create({
          product: productId,
          ...payload,
      });
      showToast('Review submitted!', 'success');
      }

      await refreshReviewsAndProduct();
    } catch (error) {
      const errorMessage = error?.message || '';
      const errorData = error?.response?.data || error?.data || {};
      
      // Handle backend validation errors
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        const errorMsg = firstError.msg || firstError.message || firstError;
        showToast(errorMsg, 'error');
      } else if (errorMessage.toLowerCase().includes('already reviewed')) {
        showToast('You have already reviewed this product.', 'error');
      } else if (errorMessage.toLowerCase().includes('product not found')) {
        showToast('Product not found. Please refresh and try again.', 'error');
      } else if (errorData.message) {
        showToast(errorData.message, 'error');
      } else {
        showToast(
          reviewBeingEdited
            ? 'Failed to update review. Please try again later.'
            : 'Failed to submit review. Please try again later.',
          'error'
        );
      }
      console.error('Review submission error:', error);
    } finally {
      setShowReviewModal(false);
      setReviewForm({ name: '', rating: 5, reviewText: '' });
      setReviewBeingEdited(null);
    }
  };

  const refreshReviewsAndProduct = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        productsAPI.getById(productId),
        reviewsAPI.getByProduct(productId),
      ]);

      if (productRes?.success && productRes?.data) {
        setProduct(productRes.data);
      }
      if (reviewsRes?.success && Array.isArray(reviewsRes.data)) {
        setReviews(reviewsRes.data);
      }
    } catch (error) {
      // Ignore refresh failures; UI already informed via toast.
    }
  };

  const handleDeleteReview = async (review) => {
    if (!review || !(review._id || review.id)) return;
    const reviewId = review._id || review.id;

    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm('Are you sure you want to delete this review?')
        : true;
    if (!confirmed) return;

    try {
      await reviewsAPI.remove(reviewId);
      setReviews((prev) => prev.filter((item) => (item._id || item.id) !== reviewId));

      const refreshed = await refreshProductStats();
      if (!refreshed) {
        setProduct((prev) =>
          prev
            ? {
        ...prev,
                numReviews: Math.max((prev.numReviews || 1) - 1, 0),
              }
            : prev
        );
      }

      showToast('Review deleted successfully.', 'success');
    } catch (error) {
      showToast('Failed to delete review. Please try again later.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Products', path: '/shop-all' },
          { label: productName.substring(0, 20) + '...', path: `/product/${productId}` }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden h-64 sm:h-80 md:h-96 lg:h-[500px]">
              <img
                src={productImages[activeImage]}
                alt={productName}
                className="w-full h-full object-contain lg:object-cover p-4"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`border-2 rounded-lg overflow-hidden flex-shrink-0 ${
                    activeImage === index ? 'border-logo-green' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    className="w-20 h-20 object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 font-sans">
                {productName}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i + 1 <= productRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm font-sans">
                  ({productReviewsCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-logo-green font-sans">
                  Rs.{productPrice.toLocaleString()}
                </span>
                {productOriginalPrice && productOriginalPrice > productPrice && (
                  <span className="text-xl text-gray-500 line-through ml-3 font-sans">
                    Rs.{productOriginalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {isComingSoon ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 font-sans">
                    Coming Soon
                  </span>
                ) : productInStock ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 font-sans">
                    ✓ In Stock {productStockCount > 0 ? `(${productStockCount} available)` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 font-sans">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handleWishlist}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors font-sans ${
                  isInWishlist(productId)
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                <span>{isInWishlist(productId) ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-logo-green hover:text-logo-green transition-colors font-sans">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
                <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button onClick={() => handleShare('facebook')} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded w-full text-left">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-sans">Facebook</span>
                  </button>
                  <button onClick={() => handleShare('twitter')} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded w-full text-left">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-sans">Twitter</span>
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded w-full text-left">
                    <WhatsAppIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-sans">WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-900 font-sans">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={decreaseQuantity}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-semibold font-sans">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Cart Actions */}
            {isComingSoon ? (
              // Coming Soon: Show Set Price for admin, Add to Wishlist for users
              isAdmin ? (
                <button
                  onClick={() => openPriceModal(product)}
                  className="w-full border border-logo-green text-logo-green font-bold py-4 px-6 rounded-lg text-lg uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white font-sans"
                >
                  Set Price
                </button>
              ) : (
                <button
                  onClick={handleWishlist}
                  className="w-full border border-logo-green text-logo-green font-bold py-4 px-6 rounded-lg text-lg uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white flex items-center justify-center space-x-2 font-sans"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                  <span>{isInWishlist(productId) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                </button>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!productInStock}
                  className={`w-full font-bold py-4 px-6 rounded-lg text-lg uppercase transition-colors duration-300 flex items-center justify-center space-x-2 font-sans ${
                    productInStock
                      ? 'bg-logo-green text-white hover:bg-banner-green'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{productInStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!productInStock}
                  className={`w-full font-bold py-4 px-6 rounded-lg text-lg uppercase transition-colors duration-300 font-sans border-2 ${
                    productInStock
                      ? 'border-logo-green text-logo-green hover:bg-green-50'
                      : 'border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Buy it now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
            {[
              productDescription && 'description',
              productIngredients && 'ingredients',
              product.howToUse && 'how to use',
              product.whoCanUse && 'who can use',
              product.caution && 'caution',
              product.faqs && 'faqs',
              'reviews'
            ].filter(Boolean).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-semibold uppercase tracking-wide transition-colors font-sans ${
                  activeTab === tab
                    ? 'text-logo-green border-b-2 border-logo-green'
                    : 'text-gray-600 hover:text-logo-green'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div className="text-gray-700 leading-relaxed font-sans">
                  {formatDescription(productDescription)}
                </div>
                {productBenefits.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-gray-900 mb-3 font-sans">Benefits:</h3>
                    <ul className="space-y-2 list-none">
                      {productBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-[#D4AF37] font-bold text-lg mt-0.5 flex-shrink-0">•</span>
                          <span className="text-gray-700 leading-relaxed font-sans text-justify flex-1">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 font-sans">Key Ingredients:</h3>
                <p className="text-gray-700 leading-relaxed font-sans">{productIngredients || 'No ingredients information available.'}</p>
              </div>
            )}

            {activeTab === 'how to use' && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 font-sans">How to Use</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 font-sans">
                  {(Array.isArray(product.howToUse) ? product.howToUse : [product.howToUse]).filter(Boolean).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'who can use' && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 font-sans">Who Can Use</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 font-sans">
                  {(Array.isArray(product.whoCanUse) ? product.whoCanUse : [product.whoCanUse]).filter(Boolean).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'caution' && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 font-sans">Caution</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 font-sans">
                  {(Array.isArray(product.caution) ? product.caution : [product.caution]).filter(Boolean).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 mb-3 font-sans">FAQs</h3>
                {(Array.isArray(product.faqs) ? product.faqs : []).map((faq, i) => (
                  <div key={i} className="border-b pb-3">
                    <p className="font-semibold text-gray-900 font-sans">Q: {faq.q}</p>
                    <p className="text-gray-700 font-sans">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-logo-green font-sans">
                      {productRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i + 1 <= productRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 font-sans">
                      {productReviewsCount} {productReviewsCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={openCreateReviewModal} className="bg-logo-green text-white px-4 py-2 rounded-lg hover:bg-banner-green transition-colors font-sans">Write a Review</button>
                    <button onClick={() => setShowAskModal(true)} className="border-2 border-logo-green text-logo-green px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-sans">Ask a Question</button>
                  </div>
                </div>
                {displayReviews.length > 0 ? (
                  <div className="space-y-4">
                        {displayReviews.map((review) => {
                      const reviewId = review._id || review.id;
                      return (
                        <div key={reviewId} className="border-b border-gray-200 pb-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 font-sans">{review.customerName}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i + 1 <= (Number(review.rating) || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                            ))}
                          </div>
                        </div>
                            {(hasAdminAccess || isAdmin) && review._id && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingReview(review)}
                                  className="text-xs font-semibold text-logo-green hover:text-banner-green transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(review)}
                                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                      </div>
                            )}
                          </div>
                          <p className="text-gray-700 font-sans whitespace-pre-line">{review.reviewText}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 font-sans">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conclusion */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-3 font-sans">Conclusion</h2>
          <p className="text-gray-700 font-sans">Add <span className="font-semibold">{productName}</span> to your skincare routine. Use daily for visible, clearer skin.</p>
        </div>


        {/* Recently Viewed */}
        <RecentlyViewedList currentId={productId} />

        {/* Related Products */}
        <RelatedProducts currentProductId={productId} />
      </div>

      {/* Ask a Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold font-sans">Ask a Question</h3>
            <input value={questionForm.name} onChange={(e)=>setQuestionForm({...questionForm,name:e.target.value})} placeholder="Your Name" className="w-full border rounded p-2 font-sans" />
            <input value={questionForm.email} onChange={(e)=>setQuestionForm({...questionForm,email:e.target.value})} placeholder="Your Email" className="w-full border rounded p-2 font-sans" />
            <textarea value={questionForm.message} onChange={(e)=>setQuestionForm({...questionForm,message:e.target.value})} placeholder="Your question" className="w-full border rounded p-2 h-28 font-sans" />
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setShowAskModal(false)} className="px-4 py-2 border rounded-lg font-sans">Cancel</button>
              <button onClick={submitQuestion} className="px-4 py-2 bg-logo-green text-white rounded-lg font-sans">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold font-sans">{isEditingReview ? 'Edit Review' : 'Write a Review'}</h3>
            <input value={reviewForm.name} onChange={(e)=>setReviewForm({...reviewForm,name:e.target.value})} placeholder="Your Name" className="w-full border rounded p-2 font-sans" />
            <select value={reviewForm.rating} onChange={(e)=>setReviewForm({...reviewForm,rating:e.target.value})} className="w-full border rounded p-2 font-sans">
              {[5,4,3,2,1].map(r=> (<option key={r} value={r}>{r} Stars</option>))}
            </select>
            <textarea value={reviewForm.reviewText} onChange={(e)=>setReviewForm({...reviewForm,reviewText:e.target.value})} placeholder="Your review" className="w-full border rounded p-2 h-28 font-sans" />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewBeingEdited(null);
                  setReviewForm({ name: '', rating: 5, reviewText: '' });
                }}
                className="px-4 py-2 border rounded-lg font-sans"
              >
                Cancel
              </button>
              <button onClick={submitReview} className="px-4 py-2 bg-logo-green text-white rounded-lg font-sans">
                {isEditingReview ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
      <SetPriceModal
        open={isPriceModalOpen}
        onClose={() => {
          setIsPriceModalOpen(false);
          setPriceProduct(null);
        }}
        product={priceProduct}
        onPriceUpdated={handlePriceUpdated}
      />
    </div>
  );
};

export default ProductDetail;

// Recently Viewed inline component
const RecentlyViewedList = ({ currentId }) => {
  const { recentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [userRole, setUserRole] = useState(null);

  // Check user role from localStorage
  useEffect(() => {
    const syncUserRole = () => {
      try {
        const authInfo = getActiveUserRole();
        setUserRole(authInfo.role);
      } catch (error) {
        console.error('Failed to determine user role', error);
        setUserRole(null);
      }
    };

    syncUserRole();

    const handleStorage = (event) => {
      if (
        event.key === 'user' ||
        event.key === 'valora_admin' ||
        event.key === 'token' ||
        event.key === 'admin_token' ||
        event.key === null
      ) {
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
  }, []);

  // Check if user is admin
  const isAdmin = isAdminAuthenticated || (userRole && userRole.toLowerCase() === 'admin');

  const items = (recentlyViewed || []).filter(p => (p._id || p.id) !== currentId).slice(0, 2);
  if (items.length === 0) return null;
  
  return (
    <div className="mt-8 sm:mt-10 md:mt-12">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 font-sans">Recently Viewed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((p, index) => {
          const prodId = p._id || p.id;
          const prodImage = p.imageUrl || (p.images && p.images[0]) || p.image || '/4.webp';
          const prodName = p.name || p.title || 'Product';
          const priceValue = typeof p.price === 'number' ? p.price : null;
          const originalPriceValue = typeof p.originalPrice === 'number' ? p.originalPrice : priceValue;
          const isComingSoon = Boolean(p.comingSoon) || priceValue === null;
          const isOutOfStock = Boolean(p.outOfStock) || (!p.inStock && p.stockCount === 0);
          const hasSale = !isComingSoon && priceValue !== null && originalPriceValue && originalPriceValue > priceValue;
          const discount = hasSale ? Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100) : 0;
          const ratingValue = getDisplayRating(p);
          const productReviews = typeof p.numReviews === 'number' ? p.numReviews : 0;

          return (
            <div 
              key={prodId} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative"
            >
              {/* Wishlist Button - Only for users, not admin */}
              {!isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInWishlist(prodId)) {
                      removeFromWishlist(prodId);
                      showToast('Removed from wishlist', 'success');
                    } else {
                      addToWishlist({ ...p, id: prodId, name: prodName, price: priceValue ?? 0, image: prodImage });
                      showToast('Added to wishlist!', 'success');
                    }
                  }}
                  className="absolute top-1 right-1 md:top-2 md:right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(prodId) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                </button>
              )}

              {/* Product Image - Clickable */}
              <div 
                className="relative h-60 sm:h-72 md:h-80 lg:h-[22rem] bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/product/${prodId}`, { state: { product: { ...p, id: prodId, _id: prodId, name: prodName, title: prodName, price: priceValue, originalPrice: originalPriceValue, images: p.images || [prodImage], image: prodImage, rating: ratingValue, numReviews: productReviews } } })}
              >
                <img 
                  src={prodImage} 
                  alt={prodName} 
                  className="w-full h-full object-contain lg:object-cover" 
                />
                
                {/* Coming Soon Badge - Priority */}
                {isComingSoon && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-500 text-white shadow-lg uppercase">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Out of Stock Badge - Priority after Coming Soon */}
                {!isComingSoon && isOutOfStock && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-500 text-white shadow-lg uppercase">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Sale Badge - Only show if not coming soon and not out of stock */}
                {!isComingSoon && !isOutOfStock && hasSale && discount > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-logo-green text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                      Sale {discount}%
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3 font-sans">
                {/* Product Title - Clickable */}
                <h3 
                  className="text-sm font-medium text-gray-800 leading-tight overflow-hidden cursor-pointer hover:text-logo-green transition-colors"
                  onClick={() => navigate(`/product/${prodId}`, { state: { product: { ...p, id: prodId, _id: prodId, name: prodName, title: prodName, price: priceValue, originalPrice: originalPriceValue, images: p.images || [prodImage], image: prodImage, rating: ratingValue, numReviews: productReviews } } })}
                >
                  {prodName}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i + 1 <= (Number(ratingValue) || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">{productReviews} reviews</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-2">
                  {isComingSoon ? (
                    <span className="text-base font-semibold text-gray-500 uppercase tracking-wide">
                      Coming Soon
                    </span>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-red-600">
                        Rs.{priceValue?.toLocaleString()}
                      </span>
                      {originalPriceValue && originalPriceValue > priceValue && (
                        <span className="text-sm text-gray-500 line-through">
                          Rs.{originalPriceValue.toLocaleString()}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Action Button */}
                {isComingSoon || isOutOfStock ? (
                  // Admin: Show "Set Price" only for Coming Soon, nothing for Out of Stock
                  // Users: Show "Add to Wishlist" for both Coming Soon and Out of Stock
                  isAdmin && isComingSoon ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Set price functionality would go here if needed
                      }}
                      className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white"
                    >
                      Set Price
                    </button>
                  ) : !isAdmin ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInWishlist(prodId)) {
                          removeFromWishlist(prodId);
                          showToast('Removed from wishlist', 'success');
                        } else {
                          addToWishlist({ ...p, id: prodId, name: prodName, price: priceValue ?? 0, image: prodImage });
                          showToast('Added to wishlist!', 'success');
                        }
                      }}
                      className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white flex items-center justify-center gap-2"
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(prodId) ? 'text-red-500 fill-current' : ''}`} />
                      {isInWishlist(prodId) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                  ) : null // Admin + Out of Stock = no button
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ 
                        ...p, 
                        id: prodId,
                        name: prodName,
                        price: priceValue,
                        image: prodImage
                      });
                      showToast('Product added to cart!', 'success');
                    }}
                    className="w-full border border-logo-green text-logo-green font-bold py-2 px-4 rounded text-sm uppercase transition-colors duration-300 hover:bg-logo-green hover:text-white"
                  >
                    ADD TO CART
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
