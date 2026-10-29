import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';

export const AuthLayout = () => {
  return (
    <div
      className="d-flex flex-column min-vh-100 justify-content-between position-relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 80% 20%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(30, 27, 75, 0.4) 0%, transparent 50%), #0F172A',
        color: '#ffffff'
      }}
    >
      {/* Brand Top Header */}
      <header className="py-3 px-4 px-md-5 d-flex justify-content-between align-items-center">
        <Link to="/" className="text-white text-decoration-none fw-bold d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--ss-color-accent-gradient)'
            }}
          >
            <Icon name="sparkles" size={18} color="#ffffff" />
          </div>
          <div>
            <span className="fs-5 fw-bold" style={{ letterSpacing: '-0.02em' }}>
              StaffSync
            </span>
            <span className="badge ms-2 bg-indigo-500 bg-opacity-25 text-indigo-300 border border-indigo-400 border-opacity-30" style={{ fontSize: '0.6875rem' }}>
              HRMS
            </span>
          </div>
        </Link>

        <div className="d-flex align-items-center gap-2 text-white-50 small">
          <Icon name="shield" size={14} color="#10B981" />
          <span className="d-none d-sm-inline">256-bit Encrypted Session</span>
        </div>
      </header>

      {/* Main Centered Content Viewport */}
      <main id="main-content" className="container d-flex align-items-center justify-content-center py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-white-50 small">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <span>© 2026 StaffSync Technologies Inc. All rights reserved.</span>
          <span>BTech Capstone Project • ServiceNow University</span>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
