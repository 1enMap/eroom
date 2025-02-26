import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E-Room</h1>
              <p className="text-sm text-gray-500">Assignment Management System</p>
            </div>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden md:flex w-1/2 bg-indigo-600 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Assignment Management System</h2>
          <p className="text-xl text-indigo-100">Manage your assignments efficiently</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;