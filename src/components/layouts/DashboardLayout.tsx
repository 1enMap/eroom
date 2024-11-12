import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, BookOpen, FileText, Home } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                to="/" 
                className="flex items-center px-2 py-2 text-gray-900 hover:text-indigo-600"
              >
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <Link 
                to="/assignments" 
                className="flex items-center px-2 py-2 text-gray-900 hover:text-indigo-600 ml-8"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Assignments
              </Link>
              <Link 
                to="/submissions" 
                className="flex items-center px-2 py-2 text-gray-900 hover:text-indigo-600 ml-8"
              >
                <FileText className="h-5 w-5 mr-2" />
                Submissions
              </Link>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}