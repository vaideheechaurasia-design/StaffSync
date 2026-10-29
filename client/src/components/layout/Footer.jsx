import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-3 px-4 border-top bg-white mt-auto" style={{ fontSize: '0.8125rem', color: '#64748B' }}>
      <div className="container-fluid p-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold text-dark">StaffSync</span>
          <span>• Modern Human Resource Management System</span>
          <span className="badge bg-light text-secondary border font-monospace">v1.0.0</span>
        </div>
        <div className="text-muted">
          <span>Enterprise MERN Capstone • Cloud Edition</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
