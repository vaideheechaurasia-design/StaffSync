import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../../components/common/Icon.jsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@staffsync.internal');
  const [password, setPassword] = useState('AdminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick-fill helper strictly populates form inputs; does not bypass backend authentication
  const handleQuickFill = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const rawMsg = err.message || '';
      if (
        rawMsg.includes('SSL alert number 80') ||
        rawMsg.includes('tlsv1 alert internal error') ||
        rawMsg.includes('MongoServerSelectionError') ||
        err.statusCode === 503
      ) {
        setErrorMessage('Database Connection Alert: MongoDB Atlas rejected the TLS handshake (SSL alert 80). Please ensure your current public IP is whitelisted under Network Access in MongoDB Atlas (or allow 0.0.0.0/0).');
      } else {
        setErrorMessage(rawMsg || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="card ss-card p-4 p-md-5 text-dark shadow-xl"
      style={{
        maxWidth: '460px',
        width: '100%',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: '#ffffff'
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div
          className="mx-auto rounded-3 d-flex align-items-center justify-content-center text-white mb-3 shadow"
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--ss-color-accent-gradient)'
          }}
        >
          <Icon name="sparkles" size={24} color="#ffffff" />
        </div>
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--ss-color-primary)', letterSpacing: '-0.02em' }}>
          Welcome to StaffSync
        </h1>
        <p className="text-muted small mb-0">
          Enterprise Human Resource Management Portal
        </p>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="alert alert-danger py-2.5 px-3 small mb-4 d-flex align-items-center gap-2 border-danger" role="alert">
          <Icon name="alert-circle" size={18} color="#DC2626" />
          <div className="flex-grow-1">{errorMessage}</div>
        </div>
      )}

      {/* Quick-fill evaluation helper */}
      <div className="p-3 mb-4 rounded-3 border bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-uppercase text-muted" style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>
            Demo Account Credentials
          </span>
          <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200" style={{ fontSize: '0.625rem', backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            Atlas Live Auth
          </span>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary flex-fill py-1.5 px-2 d-flex align-items-center justify-content-center gap-1.5"
            style={{ fontSize: '0.75rem' }}
            onClick={() => handleQuickFill('admin@staffsync.internal', 'AdminPassword123!')}
          >
            <Icon name="shield" size={13} />
            <span>HR Administrator</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label">
            Work Email Address
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <Icon name="mail" size={16} color="#64748B" />
            </span>
            <input
              id="login-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={isSubmitting}
              placeholder="admin@staffsync.internal"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label htmlFor="login-password" className="form-label mb-0">
              Password
            </label>
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Min 8 characters
            </span>
          </div>
          <div className="input-group">
            <span className="input-group-text">
              <Icon name="lock" size={16} color="#64748B" />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              placeholder="••••••••••••"
            />
            <button
              type="button"
              className="btn btn-outline-secondary border-start-0"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ backgroundColor: '#F8FAFC' }}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} color="#64748B" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-accent w-100 py-2.5 fw-bold shadow-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Verifying with Atlas...</span>
            </>
          ) : (
            <>
              <span>Sign In to StaffSync</span>
              <Icon name="arrow-right" size={16} />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4 pt-3 border-top text-muted small">
        <Icon name="lock" size={13} className="me-1 text-muted" />
        <span>HTTP-Only Secure Cookie Session • Role-Based RBAC</span>
      </div>
    </div>
  );
};

export default LoginPage;
