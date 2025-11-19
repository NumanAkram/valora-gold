import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { adminAPI } from '../../utils/api';
import Spinner from '../../components/Spinner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import ProductFormModal from '../components/ProductFormModal';
import CATEGORIES from '../../constants/categories';
import { useToast } from '../../context/ToastContext';

// Filter out "All" category from product categories (only for product upload)
const PRODUCT_CATEGORIES = CATEGORIES.filter((cat) => cat.value !== 'All');

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts({
        page,
        limit,
        search,
      });

      if (response.success) {
        setProducts(response.data);
        if (response.pagination) {
          setTotal(response.pagination.total);
        }
      } else {
        setError(response.message || 'Failed to load products');
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, search]);

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (selectedProduct) {
        const response = await adminAPI.updateProduct(selectedProduct._id || selectedProduct.id, payload);
        if (response.success) {
          showToast('Product updated successfully', 'success');
          setIsFormOpen(false);
          fetchProducts();
          // Dispatch product-updated event to update wishlist and other components
          if (typeof window !== 'undefined' && response.data) {
            window.dispatchEvent(new CustomEvent('product-updated', { detail: response.data }));
          }
        } else {
          showToast(response.message || 'Failed to update product', 'error');
        }
      } else {
        const response = await adminAPI.createProduct(payload);
        if (response.success) {
          showToast('Product created successfully', 'success');
          setIsFormOpen(false);
          setPage(1);
          fetchProducts();
          // Dispatch product-added event for new products
          if (typeof window !== 'undefined' && response.data) {
            window.dispatchEvent(new CustomEvent('product-added', { detail: response.data }));
          }
        } else {
          showToast(response.message || 'Failed to create product', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Request failed', 'error');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteProduct(product._id || product.id);
      if (response.success) {
        showToast('Product deleted', 'success');
        fetchProducts();
      } else {
        showToast(response.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const pageCount = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Product Management</h1>
          <p className="text-sm text-gray-500 font-sans">
            Manage the products available on the storefront.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-logo-green text-white text-sm font-semibold shadow hover:bg-banner-green transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search products..."
            className="w-full sm:w-72 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
          />
          <div className="text-sm text-gray-500 font-sans">
            Page {page} of {pageCount}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <HeaderCell>Name</HeaderCell>
                <HeaderCell>Category</HeaderCell>
                <HeaderCell>Price</HeaderCell>
                <HeaderCell>Stock</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10">
                    <Spinner label="Loading products..." />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-red-600 text-sm font-sans">
                    {error}
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id || product.id}>
                    <BodyCell className="font-semibold text-gray-900">{product.name}</BodyCell>
                    <BodyCell>{product.category}</BodyCell>
                    <BodyCell>
                      {product.price === null || product.price === undefined
                        ? 'Coming Soon'
                        : `Rs.${product.price.toLocaleString()}`}
                    </BodyCell>
                    <BodyCell>{product.stockCount ?? 0}</BodyCell>
                    <BodyCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </BodyCell>
                    <BodyCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsFormOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </BodyCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 font-sans">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-sans">
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, total)} of {total} products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
              disabled={page === pageCount}
              className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ProductFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={selectedProduct}
        onSubmit={handleCreateOrUpdate}
        categories={PRODUCT_CATEGORIES}
      />
    </AdminLayout>
  );
};

const HeaderCell = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
    {children}
  </th>
);

const BodyCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-sans ${className}`}>{children}</td>
);

export default AdminProducts;

