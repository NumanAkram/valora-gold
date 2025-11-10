import React, { useEffect, useRef } from 'react';
import { CheckCircle, Inbox, Trash2 } from 'lucide-react';

const AdminNotificationsPanel = ({
  open,
  onClose,
  notifications = [],
  onMarkAsRead,
  onClear,
  loading,
  error,
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div>
          <p className="text-sm font-semibold text-gray-800">Notifications</p>
          <p className="text-xs text-gray-500">Stay informed about recent activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              notifications.forEach((notification) => {
                if (!notification.read) {
                  onMarkAsRead?.(notification._id);
                }
              });
            }}
            className="inline-flex items-center gap-1 text-xs text-logo-green hover:text-banner-green font-semibold"
          >
            <CheckCircle className="h-4 w-4" />
            Mark all as read
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center text-xs text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
        {loading && (
          <div className="p-6 text-center text-gray-500 text-sm">Checking for updates...</div>
        )}

        {!loading && error && (
          <div className="p-6 text-center text-red-500 text-sm">
            Unable to load notifications. Please try again later.
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            <Inbox className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            No notifications yet
          </div>
        )}

        {!loading &&
          !error &&
          notifications.map((notification) => (
          <button
            key={notification._id}
            type="button"
            onClick={() => onMarkAsRead?.(notification._id)}
            className={`w-full text-left px-4 py-3 transition-colors ${
              notification.read ? 'bg-white hover:bg-gray-50' : 'bg-green-50 hover:bg-green-100'
            }`}
          >
            <p className="text-sm font-semibold text-gray-800">{notification.title || 'Update'}</p>
            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
            <p className="text-[11px] text-gray-400 mt-2">
              {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminNotificationsPanel;


