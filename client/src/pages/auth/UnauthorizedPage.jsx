import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const UnauthorizedPage = () => {
  const { role } = useAuth();
  const location = useLocation();
  const attemptedPath = location.state?.attemptedPath || 'the requested page';

  return (
    <div className="text-center py-5">
      <div className="display-1 mb-3" aria-hidden="true">
        🚫
      </div>
      <h1 className="h3 fw-bold mb-2" style={{ color: 'var(--ss-color-primary)' }}>
        Access Restricted (HTTP 403)
      </h1>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '460px' }}>
        Your current active role (<strong>{role}</strong>) does not have authorization to access <code>{attemptedPath}</code>.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link to="/dashboard" className="btn btn-primary">
          Return to My Dashboard
        </Link>
        <Link to="/profile" className="btn btn-outline-secondary">
          View My Permissions
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

