import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'New Assignment Available',
      message: 'A new assignment has been posted in your Mathematics class.',
      type: 'info',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      title: 'Assignment Graded',
      message: 'Your recent Physics assignment has been graded.',
      type: 'success',
      time: '1 day ago',
      read: false,
    },
    {
      id: '3',
      title: 'Upcoming Deadline',
      message: 'Chemistry assignment is due in 2 days.',
      type: 'warning',
      time: '3 days ago',
      read: true,
    },
  ],
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          time: 'Just now',
          read: false,
        },
        ...state.notifications,
      ],
    })),
    
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    })),
    
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
}));