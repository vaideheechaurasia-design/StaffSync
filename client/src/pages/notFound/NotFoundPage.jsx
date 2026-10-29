import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <div
        className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#EFF6FF',
          color: '#2563EB'
        }}
        aria-hidden="true"
      >
        <Icon name="search" size={40} color="#2563EB" />
      </div>
      <h1 className="h3 fw-bold mb-2 text-dark" style={{ letterSpacing: '-0.02em' }}>
        404 — Page Not Found
      </h1>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px', fontSize: '0.9rem' }}>
        The destination you navigated to does not exist or has been relocated within the StaffSync application.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link to="/dashboard" className="btn btn-primary shadow-sm">
          <Icon name="dashboard" size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <Link to="/" className="btn btn-outline-secondary">
          <Icon name="arrow-left" size={16} />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
