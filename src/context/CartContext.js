import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Utility function to parse price from any format
export const parsePrice = (priceValue) => {
  if (priceValue === null || priceValue === undefined || priceValue === '') {
    return 0;
  }
  
  // If it's already a number, return it
  if (typeof priceValue === 'number') {
    return priceValue;
  }
  
  // If it's a string, clean it and parse
  if (typeof priceValue === 'string') {
    // Remove all non-numeric characters except decimal point
    const cleanedPrice = priceValue.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleanedPrice);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const normalizeCartItem = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const productId =
    item._id ||
    item.id ||
    item.productId ||
    item.product?._id ||
    item.product?.id ||
    null;

  const canonicalId = productId ? String(productId) : item.slug ? String(item.slug) : null;

  if (!canonicalId) {
    console.warn('Skipping cart item without identifiable id:', item);
    return null;
  }

  const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
  const priceValue = parsePrice(item.salePrice || item.price || 0);

  return {
    ...item,
    id: canonicalId,
    _id: item._id ? String(item._id) : undefined,
    quantity,
    price: priceValue,
    salePrice: priceValue,
  };
};

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cartItems');
    if (!savedCart) {
      return [];
    }
    const parsed = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const normalized = parsed.map(normalizeCartItem).filter(Boolean);
    if (normalized.length !== parsed.length) {
      localStorage.setItem('cartItems', JSON.stringify(normalized));
    }
    return normalized;
  } catch (error) {
    console.warn('Failed to parse saved cart items:', error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [lastAddedItemId, setLastAddedItemId] = useState(null);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const productId = product?._id || product?.id || product?.productId;
      if (!productId) {
        console.warn('Attempted to add product without valid id to cart:', product);
        return prevItems;
      }

      const existingItem = prevItems.find((item) => item.id === productId);
      
      // Ensure price is stored as a number
      const priceValue = parsePrice(product.salePrice || product.price || 0);
      
      if (existingItem) {
        // If item exists, increase quantity and ensure price is stored as number
        return prevItems.map(item =>
          item.id === productId
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                price: parsePrice(item.price || item.salePrice || priceValue),
                salePrice: parsePrice(item.salePrice || item.price || priceValue)
              }
            : item
        );
      } else {
        // If new item, add with quantity 1 and ensure price is a number
        return [...prevItems, {
          ...product,
          id: productId,
          quantity: 1,
          price: priceValue,
          salePrice: priceValue
        }];
      }
    });

    const productId = product?._id || product?.id || product?.productId;
    if (productId) {
      setLastAddedItemId(String(productId));
    }
    setSidebarOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSidebarOpen(false);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Parse price using utility function
      const price = parsePrice(item.salePrice || item.price || 0);
      
      // Calculate total: price * quantity
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const openCartSidebar = () => {
    setSidebarOpen(true);
  };

  const closeCartSidebar = () => {
    setSidebarOpen(false);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isSidebarOpen,
    openCartSidebar,
    closeCartSidebar,
    lastAddedItemId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
