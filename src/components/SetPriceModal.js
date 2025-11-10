import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { productsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const SetPriceModal = ({ open, onClose, product, onPriceUpdated }) => {
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (open && product) {
      setPrice(product.price !== null && product.price !== undefined ? product.price : '');
      setOriginalPrice(
        product.originalPrice !== null && product.originalPrice !== undefined ? product.originalPrice : ''
      );
    }
  }, [open, product]);

  if (!open || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (price === '' || price === null) {
      showToast('Please enter a price.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        price: Number(price),
      };
      if (originalPrice !== '') {
        payload.originalPrice = Number(originalPrice);
      }

      const response = await productsAPI.updatePrice(product._id || product.id, payload);

      if (response.success) {
        showToast('Price updated successfully!', 'success');
        if (onPriceUpdated) {
          onPriceUpdated(response.data);
        }
        onClose();
      } else {
        showToast(response.message || 'Failed to update price.', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update price.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-logo-green/10 via-white to-white">
          <div>
            <h2 className="text-xl font-bold text-logo-green font-sans">Set Product Price</h2>
            <p className="text-sm text-gray-500 font-sans">
              Enter the price details for <span className="font-semibold text-gray-700">{product.name}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 font-sans">
              Product Price (PKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1495"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 font-sans">
              Original Price (PKR)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="Leave blank to match selling price"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-logo-green text-white text-sm font-semibold shadow hover:bg-banner-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-sans"
            >
              {loading ? 'Saving...' : 'Save Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetPriceModal;

