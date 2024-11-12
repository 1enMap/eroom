import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <div className="hidden lg:block relative w-0 flex-1 bg-indigo-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">Assignment Management System</h2>
              <p className="text-xl">Manage your assignments efficiently</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}