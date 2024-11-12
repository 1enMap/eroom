import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useAssignmentStore } from './store/assignmentStore';
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import AssignmentList from './pages/assignments/AssignmentList';
import AssignmentDetails from './pages/assignments/AssignmentDetails';
import SubmissionList from './pages/submissions/SubmissionList';
import SubmissionDetails from './pages/submissions/SubmissionDetails';
import UploadAssignment from './pages/assignments/UploadAssignment';

function App() {
  const { user } = useAuthStore();
  const { initializeStore } = useAssignmentStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {!user ? (
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        ) : (
          <Route element={<DashboardLayout />}>
            <Route path="/" element={
              user.role === 'student' 
                ? <StudentDashboard /> 
                : <TeacherDashboard />
            } />
            <Route path="/assignments" element={<AssignmentList />} />
            <Route path="/assignments/new" element={<UploadAssignment />} />
            <Route path="/assignments/:id" element={<AssignmentDetails />} />
            <Route path="/submissions" element={<SubmissionList />} />
            <Route path="/submissions/:id" element={<SubmissionDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;