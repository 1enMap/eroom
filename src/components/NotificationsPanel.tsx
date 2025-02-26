import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsPanel = ({ 
  isOpen, 
  onClose, 
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsPanelProps) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed right-0 top-0 h-full w-full max-w-md ${
              isDark ? 'bg-gray-800 border-l border-gray-700' : 'bg-white'
            } shadow-xl z-50 overflow-hidden flex flex-col`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Notifications</h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {notifications.filter(n => !n.read).length} unread notifications
                </p>
                <button
                  onClick={onMarkAllAsRead}
                  className={`text-sm font-medium ${
                    isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                  }`}
                >
                  Mark all as read
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 ${
                        !notification.read 
                          ? isDark 
                            ? 'bg-gray-700/50' 
                            : 'bg-indigo-50'
                          : ''
                      } transition-colors cursor-pointer hover:${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{notification.title}</p>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className={`w-4 h-4 ${
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                            <span className={`text-xs ${
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}>{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className={`w-16 h-16 rounded-full ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  } flex items-center justify-center mb-4`}>
                    <Bell className={`w-8 h-8 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-2`}>No notifications</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    You're all caught up! Check back later for new notifications.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;