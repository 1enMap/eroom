import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  return <LoginForm onToggleForm={() => navigate('/register')} />;
}