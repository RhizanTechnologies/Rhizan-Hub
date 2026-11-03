'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification } from '@/types';
import { apiFetch } from '@/lib/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  
  const initialLoadDone = useRef(false);
  const prevUnreadCount = useRef(0);

  // Gentle synthesized chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Note 1 (E5 - 659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2 (A5 - 880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(0, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.1, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.4);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!user) return;
    try {
      if (!isBackground) setLoading(true);
      const data = await apiFetch<AppNotification[]>('/notifications?limit=60');
      if (Array.isArray(data)) {
        setNotifications(data);
        const count = data.filter((n) => !n.read).length;
        setUnreadCount(count);

        // Sound chime if unread count increased after initial load
        if (initialLoadDone.current && count > prevUnreadCount.current) {
          playChime();
        }
        prevUnreadCount.current = count;
        initialLoadDone.current = true;
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [user, playChime]);

  // Initial load and auto-polling
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      initialLoadDone.current = false;
      return;
    }

    fetchNotifications();

    // 35s polling loop
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    }, 35000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    prevUnreadCount.current = Math.max(0, prevUnreadCount.current - 1);

    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      fetchNotifications(true);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    prevUnreadCount.current = 0;

    try {
      await apiFetch('/notifications/mark-all-read', { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      fetchNotifications(true);
    }
  };

  const deleteNotification = async (id: string) => {
    const target = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
      prevUnreadCount.current = Math.max(0, prevUnreadCount.current - 1);
    }

    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications(true);
    }
  };

  const clearAllRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    try {
      await apiFetch('/notifications/clear-read', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
      fetchNotifications(true);
    }
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const refresh = async () => {
    await fetchNotifications(true);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllRead,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
