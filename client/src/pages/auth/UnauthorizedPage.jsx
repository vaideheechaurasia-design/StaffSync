import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../../components/common/Icon.jsx';

export const UnauthorizedPage = () => {
  const { role } = useAuth();
  const location = useLocation();
  const attemptedPath = location.state?.attemptedPath || 'the requested resource';

  return (
    <div className="text-center py-5">
      <div
        className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#FEF2F2',
          color: '#DC2626'
        }}
        aria-hidden="true"
      >
        <Icon name="shield" size={40} color="#DC2626" />
      </div>
      <h1 className="h3 fw-bold mb-2 text-dark" style={{ letterSpacing: '-0.02em' }}>
        Access Restricted (HTTP 403)
      </h1>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '480px', fontSize: '0.9rem' }}>
        Your active role (<strong className="text-dark">{role}</strong>) does not have authorization permissions to access <code>{attemptedPath}</code>.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link to="/dashboard" className="btn btn-primary shadow-sm">
          <Icon name="dashboard" size={16} />
          <span>Return to Dashboard</span>
        </Link>
        <Link to="/profile" className="btn btn-outline-secondary">
          <Icon name="user" size={16} />
          <span>My Profile & Role</span>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
