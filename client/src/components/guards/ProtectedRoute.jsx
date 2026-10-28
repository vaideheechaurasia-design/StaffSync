import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5 my-5" style={{ minHeight: '300px' }}>
        <LoadingSpinner label="Verifying session..." size="md" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
