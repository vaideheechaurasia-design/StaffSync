import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const DashboardRouter = () => {
  const { role } = useAuth();

  if (role === 'HR_ADMIN') {
    return <Navigate to="/dashboard/hr" replace />;
  }
  if (role === 'MANAGER') {
    return <Navigate to="/dashboard/manager" replace />;
  }
  return <Navigate to="/dashboard/employee" replace />;
};

export default DashboardRouter;

