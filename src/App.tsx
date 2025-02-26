import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppRoutes from './routes';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

function App() {
  const { loading, loadUser } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    // Apply dark mode class to html element
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppRoutes />
        <Toaster 
          position="top-right" 
          theme={theme}
          toastOptions={{
            style: {
              background: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;