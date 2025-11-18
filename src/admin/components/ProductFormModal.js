import React, { useEffect, useState, useCallback } from 'react';
import Spinner from '../../components/Spinner';
import { uploadAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const defaultState = {
  name: '',
  price: '',
  originalPrice: '',
  description: '',
  category: '',
  imageUrl: '',
  galleryImages: [''],
  stockCount: '0',
  inStock: true,
  comingSoon: false,
  outOfStock: false,
  isFeatured: false,
};

const normalizeImages = (images) => {
  if (!Array.isArray(images)) {
    return [''];
  }
  const cleaned = images.map((url) => (url && url.trim()) || '').filter(Boolean);
  return cleaned.length > 0 ? cleaned : [''];
};

const ProductFormModal = ({ open, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const { showToast } = useToast();

  const resetForm = useCallback(() => {
    if (product) {
      const priceValue =
        product.price === null || product.price === undefined ? '' : product.price;
      const comingSoon = priceValue === '';

      setFormData({
        name: product.name || '',
        price: priceValue,
        originalPrice:
          product.originalPrice === null || product.originalPrice === undefined
            ? priceValue
            : product.originalPrice,
        description: product.description || '',
        category: product.category || '',
        imageUrl: product.images?.[0] || '',
        galleryImages: normalizeImages(product.images),
        stockCount: String(product.stockCount ?? 0),
        inStock: Boolean(product.inStock),
        comingSoon,
        outOfStock: !Boolean(product.inStock) && !comingSoon,
        isFeatured: Boolean(product.isFeatured),
      });
      setImagePreview(product.images?.[0] || '');
    } else {
      setFormData(defaultState);
      setImagePreview('');
    }
    setUploadingImage(false);
    setUploadingGallery(false);
  }, [product]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const handlePrimaryImageUpload = useCallback(
    async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      // File validation
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (JPG, PNG, GIF, WebP, etc.).', 'error');
        event.target.value = '';
        return;
      }

      // File size validation (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showToast('Image size must be less than 10MB. Please compress the image and try again.', 'error');
        event.target.value = '';
        return;
      }

      setUploadingImage(true);
      try {
        const response = await uploadAPI.uploadImage(file);
        if (response.success && response.url) {
          setFormData((prev) => ({
            ...prev,
            imageUrl: response.url,
          }));
          setImagePreview(response.url);
          showToast('Image uploaded successfully.', 'success');
        } else {
          throw new Error(response.message || 'Failed to upload image.');
        }
      } catch (error) {
        console.error('Admin primary image upload error:', error);
        let errorMessage = 'Failed to upload image.';
        if (error.message && error.message.includes('too large')) {
          errorMessage = 'Image file is too large. Please use an image smaller than 10MB.';
        } else if (error.message && error.message.includes('Only image files')) {
          errorMessage = 'Please select a valid image file (JPG, PNG, GIF, WebP, etc.).';
        } else if (error.message) {
          errorMessage = error.message;
        }
        showToast(errorMessage, 'error');
      } finally {
        setUploadingImage(false);
        event.target.value = '';
      }
    },
    [showToast]
  );

  const handleGalleryFileUpload = useCallback(
    async (event) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      if (!files.length) return;

      // File validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      const invalidFiles = files.filter((file) => !file.type.startsWith('image/') || file.size > maxSize);
      
      if (invalidFiles.length > 0) {
        showToast(
          invalidFiles.length === 1
            ? 'Please select a valid image file (JPG, PNG, GIF, WebP, etc.) under 10MB.'
            : 'Some files are invalid or too large. Only valid images under 10MB will be uploaded.',
          'error'
        );
      }

      const validFiles = files.filter((file) => file.type.startsWith('image/') && file.size <= maxSize);
      if (validFiles.length === 0) {
        event.target.value = '';
        return;
      }

      setUploadingGallery(true);
      try {
        const uploadedUrls = [];
        const errors = [];
        
        for (const file of validFiles) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const response = await uploadAPI.uploadImage(file);
            if (response.success && response.url) {
              uploadedUrls.push(response.url);
            } else {
              errors.push(`${file.name}: ${response.message || 'Upload failed'}`);
            }
          } catch (fileError) {
            console.error(`Error uploading ${file.name}:`, fileError);
            errors.push(`${file.name}: ${fileError.message || 'Upload failed'}`);
          }
        }

        if (uploadedUrls.length > 0) {
          setFormData((prev) => {
            const existing = prev.galleryImages.filter(Boolean);
            const combined = [...existing, ...uploadedUrls];
            return {
              ...prev,
              galleryImages: combined.length > 0 ? combined : [''],
            };
          });
          showToast(
            uploadedUrls.length > 1
              ? `Successfully uploaded ${uploadedUrls.length} gallery images.`
              : 'Gallery image uploaded successfully.',
            'success'
          );
        }

        if (errors.length > 0) {
          console.error('Some gallery uploads failed:', errors);
          if (uploadedUrls.length === 0) {
            showToast(`Failed to upload images: ${errors[0]}`, 'error');
          }
        }
      } catch (error) {
        console.error('Admin gallery upload error:', error);
        showToast(error.message || 'Failed to upload gallery images.', 'error');
      } finally {
        setUploadingGallery(false);
        event.target.value = '';
      }
    },
    [showToast]
  );

  const handleClearPrimaryImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
    }));
    setImagePreview('');
  };

  useEffect(() => {
    if (formData.imageUrl) {
      setImagePreview(formData.imageUrl);
    }
  }, [formData.imageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      return;
    }

    const numericStock = Number(formData.stockCount);
    if (!Number.isFinite(numericStock) || numericStock < 0) {
      return;
    }

    if (!formData.comingSoon && numericStock === 0) {
      return;
    }

    const numericPrice = formData.comingSoon ? null : Number(formData.price);
    if (!formData.comingSoon && (!Number.isFinite(numericPrice) || numericPrice < 0)) {
      return;
    }

    const numericOriginalPrice = formData.comingSoon
      ? numericPrice
      : Number(formData.originalPrice || numericPrice);

    if (!formData.comingSoon && (!Number.isFinite(numericOriginalPrice) || numericOriginalPrice < 0)) {
      return;
    }

    const normalizedGalleryImages = formData.galleryImages
      .map((url) => url && url.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      // If out of stock is checked, set stockCount to 0 and inStock to false
      const finalStockCount = formData.comingSoon ? 0 : (formData.outOfStock ? 0 : numericStock);
      const finalInStock = formData.comingSoon ? false : (formData.outOfStock ? false : formData.inStock);
      
      await onSubmit({
        name: formData.name.trim(),
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        description: formData.description.trim(),
        category: formData.category,
        imageUrl: formData.imageUrl.trim(),
        images: normalizedGalleryImages,
        stockCount: finalStockCount,
        inStock: finalInStock,
        comingSoon: formData.comingSoon,
        isFeatured: Boolean(formData.isFeatured),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 sm:px-4 py-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-logo-green/10 via-white to-white">
          <div>
            <h2 className="text-xl font-bold text-logo-green font-sans">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-gray-500 font-sans">
              Create a product and assign it to an existing category.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField label="Product Title" required>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                placeholder="e.g. Herbal Hair Growth Oil"
                required
              />
            </FormField>

            <div className="space-y-2">
              <FormField label="Product Price (PKR)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 1495"
                  disabled={formData.comingSoon}
                  className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans ${
                    formData.comingSoon ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </FormField>

              <FormField label="Original Price (PKR)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="e.g. 1995"
                  disabled={formData.comingSoon}
                  className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans ${
                    formData.comingSoon ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </FormField>

              <FormField label="Stock Quantity" required>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="stockCount"
                  value={formData.stockCount}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  disabled={formData.comingSoon || formData.outOfStock}
                  className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans ${
                    formData.comingSoon || formData.outOfStock ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </FormField>

              <label className="flex items-center space-x-2">
                <input
                  id="adminComingSoon"
                  type="checkbox"
                  checked={formData.comingSoon}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      comingSoon: e.target.checked,
                      price: e.target.checked ? '' : prev.price,
                      originalPrice: e.target.checked ? '' : prev.originalPrice,
                      stockCount: e.target.checked ? '0' : prev.stockCount === '0' ? '10' : prev.stockCount,
                      inStock: e.target.checked ? false : prev.inStock,
                      outOfStock: false, // Reset out of stock when coming soon is checked
                    }))
                  }
                  className="h-4 w-4 text-logo-green border-gray-300 rounded focus:ring-logo-green"
                />
                <span className="text-sm text-gray-600 font-sans">
                  Mark as Coming Soon (price not available yet)
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  id="adminOutOfStock"
                  type="checkbox"
                  checked={formData.outOfStock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      outOfStock: e.target.checked,
                      inStock: e.target.checked ? false : (prev.stockCount && Number(prev.stockCount) > 0 ? true : false),
                    }))
                  }
                  disabled={formData.comingSoon}
                  className="h-4 w-4 text-logo-green border-gray-300 rounded focus:ring-logo-green disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-600 font-sans">Out of stock</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField label="Product Category" required>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans bg-white cursor-pointer"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ▼
                </span>
              </div>
            </FormField>

            <div className="space-y-3">
              <FormField label="Primary Image URL">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/product.jpg"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                />
              </FormField>
              <p className="text-xs text-gray-400 font-sans">
                Leave blank to use the default store placeholder image.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-3">
                <label
                  htmlFor="admin-product-primary-image"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-dashed border-logo-green text-logo-green text-sm font-semibold hover:bg-logo-green hover:text-white transition-colors cursor-pointer"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </label>
                <input
                  id="admin-product-primary-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePrimaryImageUpload}
                  disabled={uploadingImage || loading}
                />
                {(imagePreview || formData.imageUrl) && (
                  <button
                    type="button"
                    onClick={handleClearPrimaryImage}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              {(imagePreview || formData.imageUrl) && (
                <div className="mt-3">
                  <span className="block text-xs font-semibold text-gray-600 uppercase font-sans mb-2">
                    Preview
                  </span>
                  <img
                    src={imagePreview || formData.imageUrl}
                    alt="Product preview"
                    className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 font-sans">Gallery Images</span>
                <p className="text-xs text-gray-500 font-sans">
                  Add multiple image URLs to show as product gallery/filters.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-3">
                  <label
                    htmlFor="admin-product-gallery-upload"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-dashed border-logo-green text-logo-green text-sm font-semibold hover:bg-logo-green hover:text-white transition-colors cursor-pointer"
                  >
                    {uploadingGallery ? 'Uploading...' : 'Upload Images'}
                  </label>
                  <input
                    id="admin-product-gallery-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryFileUpload}
                    disabled={uploadingGallery || loading}
                  />
                  {uploadingGallery && (
                    <span className="text-xs text-gray-500 font-sans">Uploading selected files…</span>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.galleryImages.map((image, index) => (
                    <div key={`admin-gallery-${index}`} className="flex items-center space-x-2">
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

          <FormField label="Product Description" required>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              placeholder="Describe the product, key ingredients, and benefits..."
              required
            />
          </FormField>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="h-4 w-4 rounded text-logo-green border-gray-300 focus:ring-logo-green"
              disabled={formData.comingSoon || formData.outOfStock}
            />
            <span className="text-sm text-gray-600 font-sans">Available in stock</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 rounded text-logo-green border-gray-300 focus:ring-logo-green"
            />
            <span className="text-sm text-gray-600 font-sans">Mark as featured product</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors font-sans text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-logo-green text-white text-sm font-semibold shadow hover:bg-banner-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-sans text-center flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size="sm" /> : product ? 'Save Changes' : 'Add Product'}
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

