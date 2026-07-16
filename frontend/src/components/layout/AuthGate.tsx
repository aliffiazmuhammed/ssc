import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

interface AuthGateProps {
  requiredRole?: 'admin' | 'student';
}

export const AuthGate: React.FC<AuthGateProps> = ({ requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If an admin tries to access student page, let them or redirect them?
    // Let's strictly separate them for now, or just redirect to their respective home
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
