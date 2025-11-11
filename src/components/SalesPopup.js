import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { productsAPI } from '../utils/api';

const ROTATION_INTERVAL = 5000; // switch every 5 seconds
const INITIAL_DELAY = 2000; // show 2s after load
const TRANSITION_DURATION = 500; // ms for show/hide animation
const REAPPEAR_DELAY = 15000; // show again 15s after dismiss

const BUYER_NAMES = ['Ahamed', 'Numan', 'Owais', 'Ali', 'Ahtesham', 'Mudasir'];

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

const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const SalesPopup = () => {
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const currentIndexRef = useRef(0);
  const reopenTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 20, sort: 'newest' });
        if (response.success && Array.isArray(response.data)) {
          const cleaned = response.data.filter((product) => {
            const hasImage = product?.images?.length || product?.image;
            const hasName = product?.name || product?.title;
            const isComingSoon = Boolean(product?.comingSoon);
            const rawPrice = product?.price ?? product?.salePrice ?? product?.currentPrice;
            const normalizedPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
            const hasPrice = Number.isFinite(normalizedPrice) && normalizedPrice > 0;
            return Boolean(hasImage && hasName && hasPrice && !isComingSoon);
          });
          if (isMounted) {
            const shuffled = shuffleArray(cleaned);
            currentIndexRef.current = 0;
            setProducts(shuffled);
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
    if (products.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      showNextProduct();
      setVisible(true);
      requestAnimationFrame(() => setAnimateIn(true));
    }, INITIAL_DELAY);

    return () => clearTimeout(timer);
  }, [products]);

  useEffect(() => {
    if (!visible || products.length === 0) {
      return undefined;
    }

    let changeTimer;
    let hideTimer;

    const scheduleNext = () => {
      hideTimer = setTimeout(() => {
        setAnimateIn(false);
        changeTimer = setTimeout(() => {
          showNextProduct();
          setAnimateIn(true);
          scheduleNext();
        }, TRANSITION_DURATION);
      }, ROTATION_INTERVAL);
    };

    scheduleNext();

    return () => {
      clearTimeout(changeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, products]);

  useEffect(() => () => {
    if (reopenTimeoutRef.current) {
      clearTimeout(reopenTimeoutRef.current);
    }
  }, []);

  const showNextProduct = () => {
    if (products.length === 0) return;
    if (currentIndexRef.current >= products.length) {
      currentIndexRef.current = 0;
    }
    let attempts = 0;
    let nextProduct = null;

    while (attempts < products.length) {
      const candidate = products[currentIndexRef.current];
      currentIndexRef.current = (currentIndexRef.current + 1) % products.length;
      attempts += 1;

      const rawPrice = candidate?.price ?? candidate?.salePrice ?? candidate?.currentPrice;
      const normalizedPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
      const hasPrice = Number.isFinite(normalizedPrice) && normalizedPrice > 0;
      const isComingSoon = Boolean(candidate?.comingSoon);

      if (candidate && hasPrice && !isComingSoon) {
        nextProduct = candidate;
        break;
      }
    }

    if (!nextProduct) {
      setVisible(false);
      return;
    }

    const displayName = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
    const timeAgo = TIME_AGO[Math.floor(Math.random() * TIME_AGO.length)];

    setCurrentProduct({
      ...nextProduct,
      displayName,
      displayTime: timeAgo,
    });
  };

  const handleDismiss = () => {
    if (reopenTimeoutRef.current) {
      clearTimeout(reopenTimeoutRef.current);
      reopenTimeoutRef.current = null;
    }
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      reopenTimeoutRef.current = setTimeout(() => {
        showNextProduct();
        setVisible(true);
        requestAnimationFrame(() => setAnimateIn(true));
      }, REAPPEAR_DELAY);
    }, TRANSITION_DURATION);
  };

  if (!visible || !currentProduct) {
    return null;
  }

  const productName = currentProduct.name || currentProduct.title || 'This product';
  const productImage = currentProduct.images?.[0] || currentProduct.image || '/4.png';

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
              <span className="font-semibold text-logo-green">{currentProduct.displayName}</span> from Quetta purchased
              this product.
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
            onClick={() => window.open(`/product/${currentProduct._id || currentProduct.id}`, '_self')}
            className="block text-sm font-semibold text-logo-green hover:underline text-left truncate"
          >
            {productName}
          </button>
          <p className="text-xs text-gray-500 font-sans">{currentProduct.displayTime}</p>
        </div>
      </div>
    </div>
  );
};

export default SalesPopup;
