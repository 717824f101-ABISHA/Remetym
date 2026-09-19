import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || user.status !== 'ACTIVE') {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their own role-based dashboard if they try to access unauthorized path
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DHO') return <Navigate to="/dho/dashboard" replace />;
    if (user.role === 'PHC_STAFF') return <Navigate to="/phc/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};
