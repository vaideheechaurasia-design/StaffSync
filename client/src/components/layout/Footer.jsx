import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-3 px-4 border-top bg-white mt-auto" style={{ fontSize: '0.8rem', color: 'var(--ss-color-text-muted)' }}>
      <div className="container-fluid p-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div>
          <span>StaffSync — Modern Human Resource Management System</span>
          <span className="ms-2 badge bg-light text-dark border">v1.0.0</span>
        </div>
        <div>
          <span>ServiceNow University / SkillWallet Capstone Project</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

