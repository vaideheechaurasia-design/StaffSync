import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import Icon from '../components/common/Icon.jsx';

export const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <header className="navbar navbar-expand-lg ss-topbar px-4 py-2 sticky-top shadow-xs">
        <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 mb-0">
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
            <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em' }}>
              StaffSync
            </span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-outline-secondary btn-sm">
              <Icon name="log-in" size={14} />
              <span>Sign In</span>
            </Link>
            <Link to="/dashboard" className="btn btn-accent btn-sm shadow-sm">
              <span>Launch App</span>
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-grow-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;
