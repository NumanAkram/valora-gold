import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { productsAPI } from '../utils/api';

const ROTATION_INTERVAL = 10000; // switch every 10 seconds
const INITIAL_DELAY = 8500; // show 8.5s after load (7-10 second range)
const TRANSITION_DURATION = 500; // ms for show/hide animation
const POPUP_DELAY = 5000; // 5 seconds delay between popups
const DISMISSED_STORAGE_KEY = 'valora_sales_popup_dismissed';

const BUYERS = [
  { name: 'Fatima Ahmed', city: 'Multan' },
  { name: 'Zainab Farooqi', city: 'Islamabad' },
  { name: 'Fatima Farooq', city: 'Karachi' },
  { name: 'Hira Ahmed', city: 'Gujranwala' },
  { name: 'Alina Qureshi', city: 'Faisalabad' },
  { name: 'Amna Ahmed', city: 'Lahore' },
  { name: 'Noor Shah', city: 'Gujrat' },
  { name: 'Zainab Chaudhry', city: 'Karachi' },
  { name: 'Hassan Alam', city: 'Multan' },
  { name: 'Fahad Malik', city: 'Islamabad' },
  { name: 'Ayesha Javed', city: 'Quetta' },
  { name: 'Maryam Ahmed', city: 'Multan' },
  { name: 'Noor Fatima', city: 'Lahore' },
  { name: 'Sadia Farooq', city: 'Islamabad' },
  { name: 'Imran Raza', city: 'Peshawar' },
  { name: 'Saira Qureshi', city: 'Gujranwala' },
  { name: 'Hassan Aslam', city: 'Faisalabad' },
  { name: 'Gomer Shah', city: 'Multan' },
  { name: 'Fizza Raza', city: 'Lahore' },
  { name: 'Zainab Ahmed', city: 'Multan' },
  { name: 'Bilal Ahmed', city: 'Sialkot' },
  { name: 'Hina Khan', city: 'Rawalpindi' },
  { name: 'Usman Malik', city: 'Sialkot' },
  { name: 'Umar Qureshi', city: 'Faisalabad' },
  { name: 'Omar Ahmed', city: 'Karachi' },
  { name: 'Hassan Javed', city: 'Sialkot' },
  { name: 'Bilal Burhan', city: 'Sialkot' },
  { name: 'Rizal Farooqi', city: 'Lahore' },
  { name: 'Zainab Tirmizi', city: 'Islamabad' },
  { name: 'Ahmed Malik', city: 'Peshawar' },
  { name: 'Omer Ashraf', city: 'Rawalpindi' },
  { name: 'Usama Khan', city: 'Multan' },
  { name: 'Sana Malik', city: 'Multan' },
  { name: 'Fahad Aslam', city: 'Islamabad' },
  { name: 'Noor Khan', city: 'Lahore' },
  { name: 'Aiza Ahmed', city: 'Karachi' },
  { name: 'Aiman Qureshi', city: 'Gujranwala' },
  { name: 'Ayesha Ahmed', city: 'Islamabad' },
  { name: 'Areeba Khan', city: 'Peshawar' },
  { name: 'Sadia Ahmed', city: 'Lahore' },
  { name: 'Hassan Chaudhry', city: 'Peshawar' },
  { name: 'Noman Qureshi', city: 'Rawalpindi' },
  { name: 'Omar Farooqi', city: 'Multan' },
  { name: 'Ayesha Khan', city: 'Sialkot' },
  { name: 'Bilal Shah', city: 'Lahore' },
  { name: 'Raza Farooq', city: 'Gujrat' },
  { name: 'Hassan Shah', city: 'Karachi' },
  { name: 'Mahira Ahmed', city: 'Islamabad' },
  { name: 'Sami Raza', city: 'Sialkot' },
  { name: 'Hafsa Malik', city: 'Faisalabad' },
  { name: 'Hira Farooq', city: 'Peshawar' },
  { name: 'Fizza Ahmed', city: 'Gujranwala' },
  { name: 'Ahmed Raza', city: 'Bahawalpur' },
  { name: 'Sara Ahmed', city: 'Lahore' },
  { name: 'Imran Khan', city: 'Quetta' },
  { name: 'Saba Malik', city: 'Rawalpindi' },
  { name: 'Nida Ahmed', city: 'Faisalabad' },
  { name: 'Hassan Raza', city: 'Karachi' },
  { name: 'Ayesha Rauf', city: 'Peshawar' },
  { name: 'Maryam Khan', city: 'Sialkot' },
  { name: 'Humza Ali', city: 'Multan' },
  { name: 'Rehan Ahmed', city: 'Lahore' },
  { name: 'Iqra Shah', city: 'Islamabad' },
  { name: 'Areeba Malik', city: 'Gujranwala' },
  { name: 'Sana Qureshi', city: 'Sialkot' },
  { name: 'Adeel Ahmed', city: 'Karachi' },
  { name: 'Tariq Farooq', city: 'Faisalabad' },
  { name: 'Mariam Ahmed', city: 'Islamabad' },
  { name: 'Hassan Farooq', city: 'Peshawar' },
  { name: 'Ahsan Raza', city: 'Lahore' },
  { name: 'Ali Shah', city: 'Quetta' },
  { name: 'Hiba Khan', city: 'Sialkot' },
  { name: 'Rimsha Ahmed', city: 'Rawalpindi' },
  { name: 'Usman Ali', city: 'Karachi' },
  { name: 'Hassan Ali', city: 'Multan' },
  { name: 'Fariha Shah', city: 'Islamabad' },
  { name: 'Ayesha Siddiq', city: 'Lahore' },
  { name: 'Rizwan Qureshi', city: 'Gujranwala' },
  { name: 'Nosheen Ahmed', city: 'Faisalabad' },
  { name: 'Mahnoor Khan', city: 'Peshawar' },
];

const TIME_AGO = [
  'just now',
  '2 minutes ago',
  '5 minutes ago',
  '12 minutes ago',
  '30 minutes ago',
  '1 hour ago',
  '2 hours ago',
  '5 hours ago',
  'yesterday',
];

const EVENT_PATTERN = [
  'purchase',
  'purchase',
  'purchase',
  'purchase',
  'purchase',
  'purchase',
  'purchase',
  'wishlist',
  'wishlist',
  'wishlist',
];

const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const SalesPopup = () => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [comingSoonProducts, setComingSoonProducts] = useState([]);
  const [hairOilProduct, setHairOilProduct] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const currentIndexRef = useRef(0);
  const eventOrderRef = useRef([]);

  useEffect(() => {
    // Check if popup was dismissed in this session (resets on new page load)
    const dismissed = sessionStorage.getItem(DISMISSED_STORAGE_KEY) === 'true';
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 20, sort: 'newest' });
        if (response.success && Array.isArray(response.data)) {
          const sale = [];
          const comingSoonList = [];

          response.data.forEach((product) => {
            const hasImage = product?.images?.length || product?.image;
            const hasName = product?.name || product?.title;
            if (!hasImage || !hasName) {
              return;
            }

            const rawPrice = product?.price ?? product?.salePrice ?? product?.currentPrice;
            const normalizedPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
            const hasPrice = Number.isFinite(normalizedPrice) && normalizedPrice > 0;
            const isComingSoon = Boolean(product?.comingSoon);

            if (isComingSoon) {
              comingSoonList.push(product);
            } else if (hasPrice) {
              sale.push(product);
            }
          });

          if (isMounted) {
            const shuffledSale = shuffleArray(sale);
            const shuffledComingSoon = shuffleArray(comingSoonList);
            const hairOilCandidate = sale.find((item) => {
              const label = String(item?.name || item?.title || '').toLowerCase();
              return label.includes('aura') && label.includes('hair') && label.includes('oil');
            }) || shuffledSale[0] || shuffledComingSoon[0] || null;

            setSaleProducts(shuffledSale);
            setComingSoonProducts(shuffledComingSoon);
            setHairOilProduct(hairOilCandidate);
            eventOrderRef.current = shuffleArray(EVENT_PATTERN);
            currentIndexRef.current = 0;
          }
        }
      } catch (error) {
        console.error('Sales popup fetch error:', error);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isDismissed) {
      return undefined;
    }

    if (!hairOilProduct && comingSoonProducts.length === 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      showNextEvent();
      setVisible(true);
      requestAnimationFrame(() => setAnimateIn(true));
    }, INITIAL_DELAY);

    return () => clearTimeout(timer);
  }, [hairOilProduct, comingSoonProducts, isDismissed]);

  useEffect(() => {
    if (!visible || (!hairOilProduct && comingSoonProducts.length === 0)) {
      return undefined;
    }

    let changeTimer;
    let hideTimer;

    const scheduleNext = () => {
      hideTimer = setTimeout(() => {
        setAnimateIn(false);
        changeTimer = setTimeout(() => {
          // Wait 5 seconds before showing next popup
          setTimeout(() => {
            showNextEvent();
            setAnimateIn(true);
            scheduleNext();
          }, POPUP_DELAY);
        }, TRANSITION_DURATION);
      }, ROTATION_INTERVAL);
    };

    scheduleNext();

    return () => {
      clearTimeout(changeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, hairOilProduct, comingSoonProducts]);


  const showNextEvent = () => {
    const hasPurchaseOption = Boolean(hairOilProduct || saleProducts.length);
    const hasWishlistOption = comingSoonProducts.length > 0;

    if (!hasPurchaseOption && !hasWishlistOption) {
      setVisible(false);
      return;
    }

    if (eventOrderRef.current.length === 0) {
      eventOrderRef.current = shuffleArray(EVENT_PATTERN);
      currentIndexRef.current = 0;
    }

    let eventType = eventOrderRef.current[currentIndexRef.current];
    currentIndexRef.current = (currentIndexRef.current + 1) % eventOrderRef.current.length;
    if (currentIndexRef.current === 0) {
      eventOrderRef.current = shuffleArray(eventOrderRef.current);
    }

    if (eventType === 'wishlist' && !hasWishlistOption) {
      eventType = 'purchase';
    }
    if (eventType === 'purchase' && !hasPurchaseOption) {
      eventType = 'wishlist';
    }

    const buyer = BUYERS[Math.floor(Math.random() * BUYERS.length)] || { name: 'Valora Customer', city: 'Pakistan' };
    const displayName = buyer.name;
    const buyerCity = buyer.city;
    const timeAgo = TIME_AGO[Math.floor(Math.random() * TIME_AGO.length)];

    let selectedProduct = hairOilProduct || saleProducts[0] || comingSoonProducts[0] || null;
    let actionText = '';

    if (eventType === 'wishlist' && hasWishlistOption) {
      selectedProduct = comingSoonProducts[Math.floor(Math.random() * comingSoonProducts.length)] || selectedProduct;
      const productName = selectedProduct?.name || selectedProduct?.title || 'this coming soon item';
      actionText = ` from ${buyerCity} added ${productName} (coming soon) to the wishlist.`;
    } else {
      selectedProduct = hairOilProduct || saleProducts.find((item) => item) || selectedProduct;
      const productName = selectedProduct?.name || selectedProduct?.title || 'Aura Hair Oil';
      actionText = ` from ${buyerCity} just ordered ${productName}!`;
    }

    if (!selectedProduct) {
      setVisible(false);
      return;
    }

    setCurrentEvent({
      product: selectedProduct,
      displayName: displayName,
      actionText,
      displayTime: timeAgo,
    });
  };

  const handleDismiss = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      setIsDismissed(true);
      // Save dismissal state to sessionStorage (resets on new page load)
      sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    }, TRANSITION_DURATION);
  };

  if (isDismissed || !visible || !currentEvent?.product) {
    return null;
  }

  const productName = currentEvent.product.name || currentEvent.product.title || 'This product';
  // Priority: imageUrl (primary) > images[0] (first gallery) > image (fallback) > default
  const productImage = currentEvent.product.imageUrl || currentEvent.product.images?.[0] || currentEvent.product.image || '/4.webp';

  return (
    <div
      className={`fixed bottom-6 left-4 z-[999] max-w-xs sm:max-w-sm pointer-events-auto transition-all duration-500 ${
        animateIn ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white shadow-2xl rounded-2xl border border-logo-green/30 overflow-hidden flex">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 flex-shrink-0 flex items-center justify-center">
          <img src={productImage} alt={productName} className="w-full h-full object-contain p-2" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-700 font-sans leading-snug">
              <span className="font-semibold text-logo-green">{currentEvent.displayName}</span>
              {currentEvent.actionText}
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => window.open(`/product/${currentEvent.product._id || currentEvent.product.id}`, '_self')}
            className="block text-sm font-semibold text-logo-green hover:underline text-left truncate"
          >
            {productName}
          </button>
          <p className="text-xs text-gray-500 font-sans">{currentEvent.displayTime}</p>
        </div>
      </div>
    </div>
  );
};

export default SalesPopup;