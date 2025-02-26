import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { user, updateProfile, signOut } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [fullName, setFullName] = React.useState(user?.full_name || '');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      await updateProfile({ full_name: fullName });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed right-0 top-0 h-full w-full max-w-md ${
              isDark ? 'bg-gray-800 border-l border-gray-700' : 'bg-white'
            } shadow-xl z-50 overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Settings</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className={`p-2 rounded-lg ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-8">
                {/* Profile Section */}
                <section>
                  <h3 className={`flex items-center gap-2 text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-4`}>
                    <User className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                    Profile
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } mb-1`}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } mb-1`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg ${
                          isDark 
                            ? 'bg-gray-600 border-gray-600 text-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-500'
                        } border`}
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving || fullName === user?.full_name}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDark 
                          ? 'bg-indigo-500 hover:bg-indigo-600' 
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </section>

                {/* Appearance Section */}
                <section>
                  <h3 className={`flex items-center gap-2 text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-4`}>
                    <Palette className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                    Appearance
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Theme</span>
                    <ThemeToggle />
                  </div>
                </section>

                {/* Notifications Section */}
                <section>
                  <h3 className={`flex items-center gap-2 text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-4`}>
                    <Bell className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className={`ml-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className={`ml-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Browser notifications</span>
                    </label>
                  </div>
                </section>

                {/* Security Section */}
                <section>
                  <h3 className={`flex items-center gap-2 text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-4`}>
                    <Shield className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                    Security
                  </h3>
                  <button
                    onClick={() => toast.info('Password reset link sent to your email')}
                    className={`w-full px-4 py-2 rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors mb-4`}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleSignOut}
                    className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      isDark 
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    } transition-colors`}
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};