import React from 'react';
import SignupForm from '../../components/auth/SignupForm';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  return <SignupForm onToggleForm={() => navigate('/login')} />;
}