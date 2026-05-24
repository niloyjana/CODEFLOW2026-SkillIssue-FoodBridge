import { useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification } from 'shared/types';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const fetched = await apiService.getNotifications();
      setNotifications(fetched);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch notifications');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e: any) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e: any) {
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  // Initial fetch and polling set up
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Only set up notifications for donators (restaurants and individuals)
    if (user.type !== 'restaurant' && user.type !== 'individual') {
      return;
    }

    fetchNotifications();

    // Poll every 10 seconds for real-time notifications
    timerRef.current = setInterval(() => {
      fetchNotifications(true);
    }, 10000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};

export default useNotifications;
