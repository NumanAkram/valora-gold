import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { productsAPI } from '../utils/api';
import { getDisplayRating } from '../utils/ratings';

const RelatedProducts = ({ currentProductId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await productsAPI.getRelated(currentProductId);
        if (response.success) {
          setRelatedProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        // Fallback to empty array
        setRelatedProducts([]);
      }
    };
    
    if (currentProductId) {
      fetchRelated();
    }
  }, [currentProductId]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <h2 className="text-2xl font-bold text-logo-green mb-8 font-sans">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const productId = product._id || product.id;
          const priceValue = typeof product.price === 'number'
            ? product.price
            : (typeof product.originalPrice === 'number' ? product.originalPrice : null);
          const productPrice = priceValue !== null ? `Rs.${priceValue.toLocaleString()}` : 'Price not available';
          const productImage = product.images?.[0] || product.image || '/4.webp';
          const productReviews = product.numReviews || 0;
          const displayRating = getDisplayRating(product);
          
          return (
          <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div
              className="h-48 bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, image: productImage } } })}
            >
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3
                className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green transition-colors font-sans text-sm"
                onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, image: productImage } } })}
              >
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i + 1 <= displayRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-sans">({productReviews} reviews)</span>
              </div>
              <div className="text-lg font-bold text-logo-green font-sans">{productPrice}</div>
              <button
                onClick={() => {
                  if (priceValue === null) {
                    showToast('Price not available yet for this product.', 'info');
                    return;
                  }
                  addToCart({ ...product, id: productId, price: priceValue, image: productImage });
                }}
                className="w-full bg-logo-green text-white py-2 px-4 rounded hover:bg-banner-green transition-colors font-sans font-medium text-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;
