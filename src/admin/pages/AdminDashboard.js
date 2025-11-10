import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { adminAPI } from '../../utils/api';
import Spinner from '../../components/Spinner';
import AdminLayout from '../layout/AdminLayout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboardMetrics();
        if (response.success) {
          setMetrics(response.data);
        } else {
          setError(response.message || 'Failed to fetch dashboard metrics');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Spinner label="Loading dashboard..." />;
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-sans">
          {error}
        </div>
      );
    }

    if (!metrics) {
      return null;
    }

    const {
      totals = {},
      salesChart = { labels: [], data: [] },
      inventoryChart = { labels: [], data: [] },
      latestOrders = [],
    } = metrics;

    const salesData = {
      labels: salesChart.labels,
      datasets: [
        {
          label: 'Sales',
          data: salesChart.data,
          backgroundColor: 'rgba(26, 77, 26, 0.6)',
        },
      ],
    };

    const inventoryData = {
      labels: inventoryChart.labels,
      datasets: [
        {
          label: 'Inventory',
          data: inventoryChart.data,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          tension: 0.4,
        },
      ],
    };

    return (
      <div className="space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardCard title="Total Sales" value={`Rs.${totals.sales?.toLocaleString() || 0}`} />
          <DashboardCard title="Orders" value={totals.orders || 0} />
          <DashboardCard title="Products" value={totals.products || 0} />
          <DashboardCard title="Customers" value={totals.customers || 0} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 font-sans mb-4">Sales Overview</h3>
            <Bar data={salesData} />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 font-sans mb-4">Inventory Trend</h3>
            <Line data={inventoryData} />
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 font-sans">Latest Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Order #</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Total</TableHeader>
                  <TableHeader>Date</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestOrders.map((order) => (
                  <tr key={order._id}>
                    <TableCell>{order.orderNumber || order._id.slice(-6)}</TableCell>
                    <TableCell>{order.customerName || 'Guest'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>Rs.{order.total?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </tr>
                ))}
                {latestOrders.length === 0 && (
                  <tr>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No recent orders
                    </TableCell>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  };

  return <AdminLayout>{renderContent()}</AdminLayout>;
};

const DashboardCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow px-5 py-4">
    <p className="text-sm text-gray-500 font-medium font-sans">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-2 font-sans">{value}</p>
  </div>
);

const TableHeader = ({ children }) => (
  <th
    scope="col"
    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans"
  >
    {children}
  </th>
);

const TableCell = ({ children, className = '', colSpan }) => (
  <td
    className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-sans ${className}`}
    colSpan={colSpan}
  >
    {children}
  </td>
);

const statusColor = (status = '') => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-600';
    case 'pending':
      return 'bg-yellow-100 text-yellow-600';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default AdminDashboard;

