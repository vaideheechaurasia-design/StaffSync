import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';

export const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="navbar navbar-expand-lg ss-topbar px-4 py-2">
        <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
          <Link to="/" className="navbar-brand text-white fw-bold d-flex align-items-center gap-2 mb-0">
            <span
              style={{
                display: 'inline-block',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--ss-color-accent)',
                color: '#fff',
                textAlign: 'center',
                lineHeight: '28px',
                fontWeight: 'bold'
              }}
            >
              S
            </span>
            <span>StaffSync</span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-outline-light btn-sm">
              Sign In
            </Link>
            <Link to="/dashboard" className="btn btn-accent btn-sm">
              Launch App
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

