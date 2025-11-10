import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';

const defaultState = {
  name: '',
  price: '',
  description: '',
  category: '',
  imageUrl: '',
  stockCount: 0,
  inStock: true,
};

const ProductFormModal = ({ open, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price ?? '',
        description: product.description || '',
        category: product.category || '',
        imageUrl: product.images?.[0] || '',
        stockCount: product.stockCount ?? 0,
        inStock: Boolean(product.inStock),
      });
    } else {
      setFormData(defaultState);
    }
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ...formData,
      price: formData.price === '' ? null : Number(formData.price),
      stockCount: Number(formData.stockCount),
      images: formData.imageUrl ? [formData.imageUrl] : undefined,
      comingSoon: formData.price === '',
    });
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-sans">
              {product ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-sm text-gray-500 font-sans">
              {product
                ? 'Update the product details and save changes.'
                : 'Fill in the fields to create a new product.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Name" required>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="Product name"
                required
              />
            </FormField>

            <FormField label="Price (PKR)">
              <input
                name="price"
                type="number"
                min="0"
                value={formData.price ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="Leave empty for coming soon"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Category" required>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Image URL">
              <input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="https://example.com/image.jpg"
              />
            </FormField>
          </div>

          <FormField label="Description" required>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              placeholder="Describe the product..."
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            <FormField label="Stock Count">
              <input
                name="stockCount"
                type="number"
                min="0"
                value={formData.stockCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              />
            </FormField>

            <label className="flex items-center gap-3 text-sm text-gray-700 font-sans">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="h-4 w-4 rounded text-logo-green border-gray-300 focus:ring-logo-green"
              />
              Available in stock
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-logo-green text-white text-sm font-semibold shadow hover:bg-banner-green disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" /> : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ label, required, children }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 font-sans">
    <span>
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    {children}
  </label>
);

export default ProductFormModal;

