// components/notifications/NotificationCenter.tsx
// In-app notification system
// Timestamp: Dec 11, 2025 11:45 PM EST

'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Gift, Coins, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'reward' | 'credit' | 'task';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'reward': return <Gift className="w-5 h-5 text-purple-500" />;
      case 'credit': return <Coins className="w-5 h-5 text-yellow-500" />;
      case 'task': return <Zap className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex gap-3 ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <a 
                href="/dashboard/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                View all notifications
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationCenter;
