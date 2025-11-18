import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Truck,
  LogOut,
  Home,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/shipping', label: 'Manage Shipping', icon: Truck },
];

const AdminSidebar = ({ isCollapsed }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-center py-6 border-b border-gray-200">
        <div className="text-center">
          <h1 className="text-logo-green font-semibold text-lg tracking-widest">VALORA</h1>
          {!isCollapsed && (
            <p className="text-yellow-600 text-xs font-semibold tracking-[0.4em]">ADMIN</p>
          )}
        </div>
      </div>

      <nav className="px-4 py-6 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-logo-green text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-6 space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Home className="h-4 w-4" />
          {!isCollapsed && <span>Switch to Home</span>}
        </button>
        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

