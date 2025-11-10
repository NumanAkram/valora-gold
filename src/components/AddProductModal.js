import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import CATEGORIES from '../constants/categories';
import { productsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';

const initialFormState = {
  name: '',
  price: '',
  originalPrice: '',
  stockCount: '10',
  description: '',
  category: CATEGORIES[0]?.value || '',
  imageUrl: '',
  galleryImages: [''],
};

const AddProductModal = ({ open, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (open) {
      setFormData({
        ...initialFormState,
        category: CATEGORIES[0]?.value || '',
        stockCount: '10',
        galleryImages: [''],
      });
      setComingSoon(false);
    }
  }, [open]);

  if (!open || !isAdminAuthenticated) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGalleryImageChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.galleryImages];
      updated[index] = value;
      return { ...prev, galleryImages: updated };
    });
  };

  const handleAddGalleryImage = () => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ''],
    }));
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => {
      const updated = prev.galleryImages.filter((_, i) => i !== index);
      return { ...prev, galleryImages: updated.length > 0 ? updated : [''] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!comingSoon && (formData.price === '' || formData.price === null)) {
      showToast('Please add a price or mark the product as coming soon.', 'error');
      return;
    }

    const numericStock = Number(formData.stockCount);

    if (!Number.isFinite(numericStock) || numericStock < 0) {
      showToast('Stock quantity must be a positive number or zero.', 'error');
      return;
    }

    if (!comingSoon && numericStock === 0) {
      showToast('Please provide stock greater than zero or mark as coming soon.', 'error');
      return;
    }

    const numericPrice = comingSoon ? null : Number(formData.price);

    if (!comingSoon && (!Number.isFinite(numericPrice) || numericPrice < 0)) {
      showToast('Please enter a valid product price.', 'error');
      return;
    }

    const numericOriginalPrice =
      formData.originalPrice !== ''
        ? Number(formData.originalPrice)
        : numericPrice;

    if (!comingSoon && (!Number.isFinite(numericOriginalPrice) || numericOriginalPrice < 0)) {
      showToast('Please enter a valid original price.', 'error');
      return;
    }

    const normalizedGalleryImages = formData.galleryImages
      .map((url) => url && url.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        description: formData.description.trim(),
        category: formData.category,
        imageUrl: formData.imageUrl.trim(),
        images: normalizedGalleryImages,
        comingSoon,
        stockCount: comingSoon ? 0 : numericStock,
        inStock: comingSoon ? false : numericStock > 0,
      };

      const response = await productsAPI.create(payload);

      if (response.success) {
        showToast('Product added successfully!', 'success');
        setFormData(initialFormState);
        setComingSoon(false);
        onClose();
        if (onProductCreated) {
          onProductCreated(response.data);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('product-added', { detail: response.data }));
        }
      } else {
        showToast(response.message || 'Failed to add product.', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to add product.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 sm:px-4 py-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-logo-green/10 via-white to-white">
          <div>
            <h2 className="text-xl font-bold text-logo-green font-sans">Add New Product</h2>
            <p className="text-sm text-gray-500 font-sans">Create a product and assign it to an existing category.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 font-sans">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Herbal Hair Growth Oil"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 font-sans">
                Product Price (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 1495"
                disabled={comingSoon}
                className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans ${
                  comingSoon ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <label className="block text-sm font-semibold text-gray-700 font-sans">
                Original Price (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="e.g. 1995"
                disabled={comingSoon}
                className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans ${
                  comingSoon ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <label className="block text-sm font-semibold text-gray-700 font-sans">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                name="stockCount"
                value={formData.stockCount}
                onChange={handleChange}
                placeholder="e.g. 100"
                disabled={comingSoon}
                className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans ${
                  comingSoon ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <div className="flex items-center space-x-2">
                <input
                  id="comingSoon"
                  type="checkbox"
                  checked={comingSoon}
                  onChange={(e) => {
                    setComingSoon(e.target.checked);
                    if (e.target.checked) {
                      setFormData((prev) => ({ ...prev, price: '', stockCount: '0' }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        stockCount: prev.stockCount === '0' ? '10' : prev.stockCount,
                      }));
                    }
                  }}
                  className="h-4 w-4 text-logo-green border-gray-300 rounded focus:ring-logo-green"
                />
                <label htmlFor="comingSoon" className="text-sm text-gray-600 font-sans">
                  Mark as Coming Soon (price not available yet)
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 font-sans">
                Product Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans bg-white cursor-pointer"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 font-sans">
                Product Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              />
              <p className="text-xs text-gray-400 font-sans">
                Leave blank to use the default store placeholder image.
              </p>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 font-sans">
                  Gallery Images
                </label>
                <p className="text-xs text-gray-500 font-sans">
                  Add multiple image URLs to show as product gallery/filters.
                </p>
                <div className="space-y-3">
                  {formData.galleryImages.map((image, index) => (
                    <div key={`gallery-image-${index}`} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleGalleryImageChange(index, e.target.value)}
                        placeholder="https://example.com/gallery-image.jpg"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                      />
                      {formData.galleryImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="px-3 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                    <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-dashed border-logo-green text-logo-green text-sm font-medium hover:bg-logo-green hover:text-white transition-colors"
                >
                  + Add Another Image
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 font-sans">
              Product Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the product, key ingredients, and benefits..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors font-sans text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-logo-green text-white text-sm font-semibold shadow hover:bg-banner-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-sans text-center"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

