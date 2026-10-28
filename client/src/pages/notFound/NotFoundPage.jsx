import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <div className="display-1 mb-3" aria-hidden="true">
        🔍
      </div>
      <h1 className="h3 fw-bold mb-2" style={{ color: 'var(--ss-color-primary)' }}>
        404 — Page Not Found
      </h1>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px' }}>
        The destination you navigated to does not exist or has been relocated within StaffSync.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
        <Link to="/" className="btn btn-outline-secondary">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

