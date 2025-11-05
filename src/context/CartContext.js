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

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load from localStorage on mount
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      // Ensure price is stored as a number
      const priceValue = parsePrice(product.salePrice || product.price || 0);
      
      if (existingItem) {
        // If item exists, increase quantity and ensure price is stored as number
        return prevItems.map(item =>
          item.id === product.id
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
          quantity: 1,
          price: priceValue,
          salePrice: priceValue
        }];
      }
    });
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

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
