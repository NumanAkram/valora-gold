import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('recentlyViewed');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = (product = {}) => {
    const productId = product._id || product.id;
    const productName = product.name || product.title;

    if (!productId || !productName) {
      return;
    }

    setRecentlyViewed((prev) => {
      const normalizedId = String(productId);
      const filtered = prev.filter((item) => (item._id || item.id)?.toString() !== normalizedId);

      const entry = {
        ...product,
        id: normalizedId,
        name: productName,
        price: product.price ?? product.salePrice ?? product.originalPrice ?? null,
        images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
      };

      return [entry, ...filtered].slice(0, 10);
    });
  };

  const value = {
    recentlyViewed,
    addToRecentlyViewed
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};
