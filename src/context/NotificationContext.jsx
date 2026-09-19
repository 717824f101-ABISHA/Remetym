import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications in NotificationContext:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();

    const handleSync = () => loadNotifications();
    window.addEventListener('notifications-updated', handleSync);
    return () => window.removeEventListener('notifications-updated', handleSync);
  }, [loadNotifications]);

  const markAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationId ? { ...n, read: true } : n))
    );
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  };

  const clearNotifications = async () => {
    if (!user) return;
    await notificationService.clearNotifications(user);
    setNotifications([]);
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
