import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  FileCheck, 
  LogOut,
  User,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNotificationStore } from '../store/notificationStore';
import { SettingsPanel } from '../components/SettingsPanel';
import NotificationsPanel from '../components/NotificationsPanel';

const DashboardLayout = () => {
  const { user, signOut } = useAuthStore();
  const { theme } = useThemeStore();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserCardHovered, setIsUserCardHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/assignments', icon: BookOpen, label: 'Assignments' },
    { to: '/submissions', icon: FileCheck, label: 'Submissions' },
  ];

  const isDark = theme === 'dark';
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isMobile) {
    return null; // Don't render anything for mobile as per requirement
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? '80px' : '280px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`sticky top-0 h-screen ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r flex flex-col`}
      >
        <div className="p-6 flex items-center gap-4">
          <div className={`flex items-center gap-3 ${!isSidebarCollapsed ? 'w-full' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  E-Room
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Assignment System
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 transition-all ${
                    isSidebarCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? isDark 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'bg-indigo-50 text-indigo-600'
                      : isDark
                        ? 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${isSidebarCollapsed ? 'rounded-full aspect-square w-12 h-12 p-0' : 'rounded-xl'}`
                }
              >
                <item.icon className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-6 h-6'}`} />
                {!isSidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <motion.div 
            className={`relative flex items-center gap-3 ${
              isSidebarCollapsed ? 'justify-center p-0 aspect-square w-12 h-12' : 'p-3'
            } ${
              isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors cursor-pointer group rounded-full`}
            onClick={() => setIsSettingsOpen(true)}
            onMouseEnter={() => setIsUserCardHovered(true)}
            onMouseLeave={() => setIsUserCardHovered(false)}
          >
            <div className={`${
              isSidebarCollapsed ? 'w-full h-full' : 'w-10 h-10'
            } rounded-full ${
              isDark ? 'bg-gray-600' : 'bg-indigo-100'
            } flex items-center justify-center`}>
              <User className={`${
                isSidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5'
              } ${
                isDark ? 'text-gray-300' : 'text-indigo-600'
              }`} />
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{user?.full_name}</p>
                  <p className={`text-sm capitalize truncate ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>{user?.role}</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isUserCardHovered ? 1 : 0.5,
                    scale: isUserCardHovered ? 1 : 0.9
                  }}
                  className={`flex items-center justify-center ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } group-hover:${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  <Settings className="w-5 h-5" />
                </motion.div>
              </>
            )}
          </motion.div>
        </div>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
          } border ${
            isDark ? 'border-gray-600' : 'border-gray-200'
          } flex items-center justify-center hover:${
            isDark ? 'bg-gray-600' : 'bg-gray-50'
          } transition-colors shadow-sm`}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`sticky top-0 z-10 ${
          isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        } border-b backdrop-blur-sm`}>
          <div className="flex items-center justify-between px-8 h-20">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className={`w-12 h-12 rounded-full ${
                  isDark 
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-all relative flex items-center justify-center`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 ${
                    isDark ? 'bg-indigo-500' : 'bg-indigo-600'
                  } text-white text-xs flex items-center justify-center rounded-full`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
};

export default DashboardLayout;