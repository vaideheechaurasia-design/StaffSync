import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div
      className="d-flex flex-column min-vh-100 justify-content-between"
      style={{
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        color: '#ffffff'
      }}
    >
      {/* Brand Top Header */}
      <header className="py-3 px-4">
        <Link to="/" className="text-white text-decoration-none fw-bold d-flex align-items-center gap-2">
          <span
            style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--ss-color-accent)',
              color: '#fff',
              textAlign: 'center',
              lineHeight: '32px',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            S
          </span>
          <span className="fs-5">StaffSync</span>
        </Link>
      </header>

      {/* Main Centered Content Viewport */}
      <main id="main-content" className="container d-flex align-items-center justify-content-center py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-white-50 small">
        <span>StaffSync HRMS • ServiceNow University Capstone • Phase 4 Foundation</span>
      </footer>
    </div>
  );
};

export default AuthLayout;

