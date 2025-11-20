import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../utils/api';
import { isUserSession } from '../utils/authHelper';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlistItems');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [loading, setLoading] = useState(false);

  // Load wishlist from database on mount if user is logged in
  useEffect(() => {
    const loadWishlistFromDatabase = async () => {
      if (!isUserSession()) {
        // User not logged in, use localStorage only
        return;
      }

      try {
        setLoading(true);
        const response = await wishlistAPI.get();
        if (response.success && Array.isArray(response.data)) {
          // Merge database wishlist with localStorage (database takes priority)
          const dbWishlist = response.data.map(item => {
            const primaryImage = item.imageUrl || (item.images && item.images[0]) || '/4.webp';
            const allImages = item.images && item.images.length > 0 
              ? item.images 
              : (item.imageUrl ? [item.imageUrl] : [primaryImage]);
            
            return {
              id: item._id || item.id,
              _id: item._id || item.id,
              name: item.name,
              title: item.name,
              price: item.price,
              originalPrice: item.originalPrice,
              imageUrl: item.imageUrl || primaryImage,
              image: primaryImage,
              images: allImages,
              category: item.category,
              rating: item.rating,
              numReviews: item.numReviews,
              inStock: item.inStock,
              stockCount: item.stockCount,
              comingSoon: item.comingSoon,
            };
          });

          setWishlistItems(dbWishlist);
        }
      } catch (error) {
        console.error('Failed to load wishlist from database:', error);
        // Continue with localStorage wishlist if database load fails
      } finally {
        setLoading(false);
      }
    };

    loadWishlistFromDatabase();

    // Listen for user login to sync localStorage wishlist to database
    const handleUserUpdated = async () => {
      if (!isUserSession()) {
        return;
      }

      // Wait a bit for auth to settle
      setTimeout(async () => {
        const localWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        
        // Sync each localStorage item to database
        for (const item of localWishlist) {
          const productId = item._id || item.id;
          if (productId) {
            try {
              await wishlistAPI.add(productId);
            } catch (error) {
              // Product might already be in database wishlist, ignore error
              console.log('Product already in database wishlist or error:', productId);
            }
          }
        }

        // Reload from database to get latest state
        await loadWishlistFromDatabase();
      }, 1000);
    };

    window.addEventListener('valora-user-updated', handleUserUpdated);

    return () => {
      window.removeEventListener('valora-user-updated', handleUserUpdated);
    };
  }, []);

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Update wishlist item when product is updated
  const updateWishlistItem = useCallback((updatedProduct) => {
    if (!updatedProduct || (!updatedProduct._id && !updatedProduct.id)) {
      return;
    }

    const productId = updatedProduct._id || updatedProduct.id;
    
    setWishlistItems((prevItems) => {
      const itemIndex = prevItems.findIndex(
        item => (item.id || item._id)?.toString() === productId.toString()
      );

      if (itemIndex === -1) {
        // Product not in wishlist, no update needed
        return prevItems;
      }

      // Update the product in wishlist with new data
      const updatedItems = [...prevItems];
      const existingItem = updatedItems[itemIndex];
      
      // Merge updated product data while preserving wishlist-specific properties
      // Determine primary image from updated product
      const primaryImage = updatedProduct.imageUrl || 
                          (updatedProduct.images && updatedProduct.images[0]) || 
                          updatedProduct.image || 
                          existingItem.image;
      
      const allImages = updatedProduct.images && updatedProduct.images.length > 0
        ? updatedProduct.images
        : (updatedProduct.imageUrl ? [updatedProduct.imageUrl] : existingItem.images || [primaryImage]);
      
      updatedItems[itemIndex] = {
        ...existingItem,
        ...updatedProduct,
        // Ensure id is preserved (use _id if id doesn't exist)
        id: updatedProduct.id || updatedProduct._id || existingItem.id,
        _id: updatedProduct._id || updatedProduct.id || existingItem._id,
        // Update key fields that admin might change
        name: updatedProduct.name !== undefined ? updatedProduct.name : (existingItem.name || existingItem.title),
        title: updatedProduct.name || updatedProduct.title || existingItem.title || existingItem.name,
        price: updatedProduct.price !== undefined ? updatedProduct.price : existingItem.price,
        originalPrice: updatedProduct.originalPrice !== undefined ? updatedProduct.originalPrice : existingItem.originalPrice,
        inStock: updatedProduct.inStock !== undefined ? updatedProduct.inStock : existingItem.inStock,
        stockCount: updatedProduct.stockCount !== undefined ? updatedProduct.stockCount : existingItem.stockCount,
        comingSoon: updatedProduct.comingSoon !== undefined ? updatedProduct.comingSoon : existingItem.comingSoon,
        // Update image fields properly
        imageUrl: updatedProduct.imageUrl !== undefined ? updatedProduct.imageUrl : existingItem.imageUrl,
        images: allImages,
        image: primaryImage,
      };

      // Return new array to trigger re-render
      return [...updatedItems];
    });
  }, []);

  // Listen for product-updated events
  useEffect(() => {
    const handleProductUpdated = (event) => {
      const updatedProduct = event.detail;
      if (updatedProduct) {
        updateWishlistItem(updatedProduct);
      }
    };

    window.addEventListener('product-updated', handleProductUpdated);

    return () => {
      window.removeEventListener('product-updated', handleProductUpdated);
    };
  }, [updateWishlistItem]);

  const addToWishlist = async (product) => {
    const productId = product._id || product.id;
    
    // Update local state immediately for better UX
    setWishlistItems((prevItems) => {
      const exists = prevItems.find(item => (item.id || item._id)?.toString() === productId.toString());
      if (!exists) {
        return [...prevItems, {
          ...product,
          id: productId,
          _id: productId,
        }];
      }
      return prevItems;
    });

    // Sync with database if user is logged in
    if (isUserSession() && productId) {
      try {
        await wishlistAPI.add(productId);
      } catch (error) {
        console.error('Failed to add product to database wishlist:', error);
        // Revert local state on error
        setWishlistItems((prevItems) => 
          prevItems.filter(item => (item.id || item._id)?.toString() !== productId.toString())
        );
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    // Update local state immediately for better UX
    setWishlistItems((prevItems) => prevItems.filter(item => (item.id || item._id)?.toString() !== productId.toString()));

    // Sync with database if user is logged in
    if (isUserSession() && productId) {
      try {
        await wishlistAPI.remove(productId);
      } catch (error) {
        console.error('Failed to remove product from database wishlist:', error);
        // Note: We don't revert here as user already sees it removed
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    loading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
