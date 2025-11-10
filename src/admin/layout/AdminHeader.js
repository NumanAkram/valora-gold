import React from 'react';
import { Bell, Menu, Search, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminNotifications } from '../context/AdminNotificationContext';
import AdminNotificationsPanel from './AdminNotificationsPanel';

const AdminHeader = ({ onToggleSidebar }) => {
  const { admin } = useAdminAuth();
  const { unreadCount, notifications, loading, error, markAsRead, clearAll } = useAdminNotifications();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-0 focus:ring-0 text-sm pl-2 text-gray-700 font-sans"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            {(unreadCount > 0 || loading) && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-red-500 text-white text-[10px] px-1">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : unreadCount}
              </span>
            )}
          </button>
          <AdminNotificationsPanel
            open={open}
            onClose={() => setOpen(false)}
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onClear={clearAll}
            loading={loading}
            error={error}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              {admin?.name || 'Administrator'}
            </p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-logo-green/10 text-logo-green flex items-center justify-center font-semibold uppercase">
            {(admin?.name || 'A').slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

