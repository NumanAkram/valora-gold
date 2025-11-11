import React, { useEffect, useMemo, useState } from 'react';
import { Filter, RefreshCcw, Eye, ClipboardEdit } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import { adminAPI } from '../../utils/api';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import OrderDetailsModal from '../components/OrderDetailsModal';
import OrderStatusDialog from '../components/OrderStatusDialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusOrder, setStatusOrder] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
      };

      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await adminAPI.getOrders(params);
      if (response.success) {
        setOrders(response.data || []);
        setTotal(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load orders');
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, JSON.stringify(filters)]);

  const pageCount = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const openDetails = (orderId) => {
    setDetailsOrderId(orderId);
    setIsDetailsOpen(true);
  };

  const openStatusDialog = (order) => {
    setStatusOrder(order);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = async (payload) => {
    try {
      await adminAPI.updateOrderStatus(statusOrder._id, payload);
      showToast('Order updated successfully', 'success');
      setIsStatusDialogOpen(false);
      fetchOrders();
    } catch (err) {
      showToast(err.message || 'Failed to update order', 'error');
      throw err;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Order Management</h1>
          <p className="text-sm text-gray-500 font-sans">
            Track and manage customer orders, update statuses, and review order history.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl shadow">
        <div className="px-4 py-4 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 font-sans">
            <Filter className="h-4 w-4 text-logo-green" />
            Filters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase font-sans">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase font-sans">
                Search
              </label>
              <input
                type="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by order number, customer name, email, or phone"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase font-sans">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-logo-green hover:text-banner-green transition-colors"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <HeaderCell>Order #</HeaderCell>
                <HeaderCell>Customer</HeaderCell>
                <HeaderCell>Total</HeaderCell>
                <HeaderCell>Payment</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Placed On</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10">
                    <Spinner label="Loading orders..." />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-red-600 text-sm font-sans">
                    {error}
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <BodyCell className="font-semibold text-gray-900">
                      {order.orderNumber}
                    </BodyCell>
                    <BodyCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {order.user?.name || 'Guest'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.user?.email || 'No email'}
                        </span>
                      </div>
                    </BodyCell>
                    <BodyCell className="font-semibold text-gray-900">
                      Rs.{Number(order.total || 0).toLocaleString()}
                    </BodyCell>
                    <BodyCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          PAYMENT_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </BodyCell>
                    <BodyCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </BodyCell>
                    <BodyCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : 'N/A'}
                    </BodyCell>
                    <BodyCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetails(order._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => openStatusDialog(order)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-logo-green/40 bg-logo-green/10 text-xs font-semibold text-logo-green hover:bg-logo-green/20"
                        >
                          <ClipboardEdit className="h-4 w-4" />
                          Update
                        </button>
                      </div>
                    </BodyCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500 font-sans">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500 font-sans">
            Showing {(page - 1) * limit + (orders.length ? 1 : 0)}-
            {Math.min(page * limit, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-sans">
              Page {page} of {pageCount}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
              disabled={page === pageCount}
              className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <OrderDetailsModal
        open={isDetailsOpen}
        orderId={detailsOrderId}
        onClose={() => setIsDetailsOpen(false)}
      />

      <OrderStatusDialog
        open={isStatusDialogOpen}
        order={statusOrder}
        onClose={() => setIsStatusDialogOpen(false)}
        onSubmit={handleUpdateStatus}
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
  <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-sans ${className}`}>
    {children}
  </td>
);

export default AdminOrders;

