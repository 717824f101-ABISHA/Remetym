import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', color: '#F8FAFC' }}>
        <div>Loading RemeTym...</div>
      </div>
    );
  }

  if (!user || user.status !== 'ACTIVE') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
