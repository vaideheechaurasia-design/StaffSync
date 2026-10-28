import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = {
  HR_ADMIN: {
    id: 'usr-admin-01',
    employeeId: 'emp-admin-01',
    employeeCode: 'EMP-1001',
    firstName: 'Eleanor',
    lastName: 'Vance',
    email: 'admin@staffsync.internal',
    role: 'HR_ADMIN',
    designation: 'Director of Human Resources',
    department: 'People Operations'
  },
  MANAGER: {
    id: 'usr-mgr-01',
    employeeId: 'emp-mgr-01',
    employeeCode: 'EMP-1002',
    firstName: 'Marcus',
    lastName: 'Brody',
    email: 'manager@staffsync.internal',
    role: 'MANAGER',
    designation: 'Engineering Team Lead',
    department: 'Engineering'
  },
  EMPLOYEE: {
    id: 'usr-emp-01',
    employeeId: 'emp-emp-01',
    employeeCode: 'EMP-1003',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'employee@staffsync.internal',
    role: 'EMPLOYEE',
    designation: 'Software Engineer',
    department: 'Engineering'
  }
};

export const AuthProvider = ({ children }) => {
  // Phase 4 preview state: starts as HR_ADMIN so developer can inspect all views, with easy role switching
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.HR_ADMIN);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      setCurrentUser(DEMO_USERS[roleKey]);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const loginDemo = (roleKey = 'EMPLOYEE') => {
    switchRole(roleKey);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated,
        switchRole,
        loginDemo,
        logout,
        isPhase4Foundation: true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

