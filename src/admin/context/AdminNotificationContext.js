import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { adminAPI } from '../../utils/api';

const AdminNotificationContext = createContext();

export const useAdminNotifications = () => {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) {
    throw new Error('useAdminNotifications must be used within AdminNotificationProvider');
  }
  return ctx;
};

const REFRESH_INTERVAL = 10000;
const AUDIO_SRC = '/mixkit-software-interface-remove-2576.wav';

export const AdminNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const previousUnreadRef = useRef(0);
  const initialLoadRef = useRef(true);

  const playNotificationSound = () => {
    try {
      const audio = new Audio(AUDIO_SRC);
      audio.volume = 0.7;
      audio.play().catch((err) => {
        console.error('Notification audio playback error:', err);
      });
    } catch (soundError) {
      console.error('Notification sound error:', soundError);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNotifications();
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
        const unread = response.data.filter((item) => !item.read).length;
        setUnreadCount(unread);

        if (!initialLoadRef.current && unread > previousUnreadRef.current) {
          playNotificationSound();
        }

        previousUnreadRef.current = unread;
        initialLoadRef.current = false;
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await adminAPI.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      previousUnreadRef.current = Math.max(previousUnreadRef.current - 1, 0);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const clearAll = async () => {
    try {
      await adminAPI.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
      previousUnreadRef.current = 0;
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      markAsRead,
      clearAll,
      refresh: fetchNotifications,
    }),
    [notifications, unreadCount, loading, error]
  );

  return <AdminNotificationContext.Provider value={value}>{children}</AdminNotificationContext.Provider>;
};


