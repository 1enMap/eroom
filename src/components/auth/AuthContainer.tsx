import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthContainer() {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return showLogin ? (
    <LoginForm onToggleForm={toggleForm} />
  ) : (
    <SignupForm onToggleForm={toggleForm} />
  );
}