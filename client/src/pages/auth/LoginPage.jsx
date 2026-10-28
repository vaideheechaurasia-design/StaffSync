import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const LoginPage = () => {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@staffsync.internal');
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState('HR_ADMIN');

  const handleDemoSelect = (roleKey, demoEmail) => {
    setSelectedRole(roleKey);
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In Phase 4, login sets the selected role context so the developer can evaluate the UI
    loginDemo(selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="card ss-card p-4 p-md-5 text-dark shadow-lg" style={{ maxWidth: '440px', width: '100%' }}>
      <div className="text-center mb-4">
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--ss-color-primary)' }}>
          Welcome Back
        </h1>
        <p className="text-muted small">
          Sign in to your StaffSync organizational portal
        </p>
      </div>

      {/* Phase 4 Informational Banner */}
      <div className="alert alert-info py-2 px-3 small mb-4" role="status">
        <strong>Phase 4 Foundation Note:</strong> Backend JWT authentication will be activated in Phase 6. You can preview all role portals using the quick demo pills below.
      </div>

      {/* Demo Credentials Quick-Select Bar */}
      <div className="mb-4">
        <label className="form-label small fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>
          Select Demo Role to Preview:
        </label>
        <div className="d-flex gap-2">
          <button
            type="button"
            className={`btn btn-sm flex-fill ${selectedRole === 'HR_ADMIN' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleDemoSelect('HR_ADMIN', 'admin@staffsync.internal')}
          >
            HR Admin
          </button>
          <button
            type="button"
            className={`btn btn-sm flex-fill ${selectedRole === 'MANAGER' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleDemoSelect('MANAGER', 'manager@staffsync.internal')}
          >
            Manager
          </button>
          <button
            type="button"
            className={`btn btn-sm flex-fill ${selectedRole === 'EMPLOYEE' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleDemoSelect('EMPLOYEE', 'employee@staffsync.internal')}
          >
            Employee
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label fw-semibold small">
            Work Email Address
          </label>
          <input
            id="login-email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="login-password" className="form-label fw-semibold small">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold">
          Sign In to Portal →
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

