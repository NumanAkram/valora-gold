import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Search } from 'lucide-react';
import { getDisplayRating } from '../utils/ratings';
import { useCart } from '../context/CartContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { productsAPI } from '../utils/api';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get query from URL and search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    if (query) {
      setLoading(true);
      productsAPI.search(query)
        .then((response) => {
          console.log('Search response:', response);
          if (response && response.success) {
            setSearchResults(response.data || []);
          } else {
            console.warn('Search response missing success flag:', response);
            setSearchResults([]);
          }
        })
        .catch((error) => {
          console.error('Search error:', error);
          setSearchResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSearchResults([]);
    }
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Search', path: '/search' }
        ]} />

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, category, keywords..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green font-sans"
              />
            </div>
            <button
              type="submit"
              className="bg-logo-green text-white px-8 py-3 rounded-lg hover:bg-banner-green transition-colors font-sans font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 font-sans">Searching...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">
              Search Results for "{searchQuery}" ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => {
                const productId = product._id || product.id;
                const priceValue = typeof product.price === 'number' ? product.price : null;
                const originalValue = typeof product.originalPrice === 'number' ? product.originalPrice : null;
                const hasDiscount =
                  priceValue !== null && originalValue !== null && originalValue > priceValue;
                const formattedPrice = priceValue !== null ? `Rs.${priceValue.toLocaleString()}` : null;
                const formattedOriginal = originalValue !== null ? `Rs.${originalValue.toLocaleString()}` : null;
                const productImage = product.images?.[0] || product.image || '/4.webp';
                const productReviews = product.numReviews || 0;
                const displayRating = getDisplayRating(product);
                
                return (
                <div key={productId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div
                    className="h-64 bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, images: product.images || [productImage], image: productImage } } })}
                  >
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3
                      className="font-semibold text-gray-900 cursor-pointer hover:text-logo-green font-sans"
                      onClick={() => navigate(`/product/${productId}`, { state: { product: { ...product, id: productId, images: product.images || [productImage], image: productImage } } })}
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
                      <span className="text-sm text-gray-600 font-sans">
                        ({productReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasDiscount && formattedOriginal && (
                        <span className="text-sm text-red-600 line-through font-sans">
                          {formattedOriginal}
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-900 font-sans">
                        {formattedPrice || formattedOriginal || 'Rs.0'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        addToCart({
                          ...product,
                          id: productId,
                          price: priceValue ?? originalValue ?? 0,
                          image: productImage,
                        });
                      }}
                      className="w-full bg-logo-green text-white py-2 px-4 rounded hover:bg-banner-green transition-colors font-sans font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </>
        ) : searchQuery ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              No products found
            </h3>
            <p className="text-gray-600 font-sans">
              Try searching for something else
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              Start searching
            </h3>
            <p className="text-gray-600 font-sans">
              Enter a product name in the search box above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
