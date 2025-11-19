import React, { useEffect, useMemo, useState } from 'react';
import { Users as UsersIcon, Search, Shield, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import AdminLayout from '../layout/AdminLayout';
import { adminAPI } from '../../utils/api';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import UserFormModal from '../components/UserFormModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
      };

      if (filters.role && filters.role !== 'all') {
        params.role = filters.role;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await adminAPI.getUsers(params);

      if (response.success) {
        setUsers(response.data || []);
        setTotal(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const openEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (payload) => {
    try {
      await adminAPI.updateUser(selectedUser._id, payload);
      showToast('User updated successfully', 'success');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
      throw err;
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      showToast('Preparing export...', 'success');

      // Fetch all users without pagination
      const params = {
        page: 1,
        limit: 10000, // Large limit to get all users
      };

      if (filters.role && filters.role !== 'all') {
        params.role = filters.role;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await adminAPI.getUsers(params);

      if (!response.success || !response.data || response.data.length === 0) {
        showToast('No users found to export', 'error');
        return;
      }

      // Format data for Excel
      const excelData = response.data.map((user) => {
        const address = user.latestAddress
          ? `${user.latestAddress.street || ''}, ${user.latestAddress.city || ''}, ${user.latestAddress.province || ''}, ${user.latestAddress.postalCode || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')
          : 'No address';

        return {
          'User Name': user.name || 'N/A',
          'User ID': user._id || 'N/A',
          'Role': user.role === 'admin' ? 'Administrator' : 'Customer',
          'Email': user.email || 'N/A',
          'Phone Number': user.phone || 'N/A',
          'Orders Count': user.ordersCount || 0,
          'Address': address,
        };
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Data');

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // User Name
        { wch: 25 }, // User ID
        { wch: 15 }, // Role
        { wch: 30 }, // Email
        { wch: 18 }, // Phone Number
        { wch: 12 }, // Orders Count
        { wch: 50 }, // Address
      ];
      worksheet['!cols'] = columnWidths;

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Data exported successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast(err.message || 'Failed to export data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">User Management</h1>
          <p className="text-sm text-gray-500 font-sans">
            Manage customer accounts, update roles, and review user activity.
          </p>
        </div>
        <button
          onClick={handleExportData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-logo-green text-white rounded-lg font-semibold text-sm hover:bg-banner-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
        >
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl shadow">
        <div className="px-4 py-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase font-sans">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
            >
              <option value="all">All Roles</option>
              <option value="user">Customers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-gray-500 uppercase font-sans">
              Search
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, email, or phone"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-green focus:border-transparent text-sm font-sans"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <HeaderCell>User</HeaderCell>
                <HeaderCell>Email</HeaderCell>
                <HeaderCell>Phone</HeaderCell>
                <HeaderCell>Orders</HeaderCell>
                <HeaderCell>Address</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10">
                    <Spinner label="Loading users..." />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-red-600 text-sm font-sans">
                    {error}
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <BodyCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-logo-green/10 text-logo-green flex items-center justify-center font-semibold uppercase">
                              {(user.name || 'U').slice(0, 2)}
                            </div>
                          )}
                          {/* Role Icon Badge */}
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            {user.role === 'admin' ? (
                              <div className="h-4 w-4 rounded-full bg-purple-600 flex items-center justify-center">
                                <Shield className="h-2.5 w-2.5 text-white" />
                              </div>
                            ) : (
                              <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center">
                                <UsersIcon className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{user.name}</span>
                          <span className="text-xs text-gray-500">
                            ID: {user._id?.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </BodyCell>
                    <BodyCell>{user.email}</BodyCell>
                    <BodyCell>{user.phone || 'N/A'}</BodyCell>
                    <BodyCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{user.ordersCount || 0}</span>
                        <span className="text-xs text-gray-500">order{user.ordersCount !== 1 ? 's' : ''}</span>
                      </div>
                    </BodyCell>
                    <BodyCell>
                      <div className="max-w-[10rem]">
                        {user.latestAddress ? (
                          <div className="text-sm text-gray-700">
                            <p className="font-medium truncate">{user.latestAddress.street || 'N/A'}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {[user.latestAddress.city, user.latestAddress.province].filter(Boolean).join(', ') || 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No address</span>
                        )}
                      </div>
                    </BodyCell>
                    <BodyCell>
                      <button
                        onClick={() => openEditUser(user)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    </BodyCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 font-sans">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500 font-sans">
            Showing {(page - 1) * limit + (users.length ? 1 : 0)}-
            {Math.min(page * limit, total)} of {total} users
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-logo-green text-white rounded-lg font-semibold text-sm hover:bg-banner-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
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
        </div>
      </section>

      <UserFormModal
        open={isModalOpen}
        user={selectedUser}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateUser}
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

export default AdminUsers;