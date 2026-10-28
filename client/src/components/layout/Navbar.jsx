import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { healthService } from '../../api/healthService.js';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { currentUser, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    healthService.checkHealth()
      .then((data) => {
        if (isMounted) setApiStatus(data.status === 'healthy' ? 'online' : 'error');
      })
      .catch(() => {
        if (isMounted) setApiStatus('offline');
      });
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="navbar navbar-expand-lg ss-topbar px-3 sticky-top" aria-label="Top Header">
        <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
          {/* Left Brand & Toggle */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-outline-light btn-sm touch-target d-lg-none"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <Link to="/dashboard" className="navbar-brand text-white fw-bold d-flex align-items-center gap-2 mb-0">
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
          </div>

          {/* Center Demo Role Switcher & API Status */}
          <div className="d-none d-md-flex align-items-center gap-2">
            <span className="text-white-50 small me-1">Role Preview:</span>
            <div className="btn-group btn-group-sm" role="group" aria-label="Role preview switch">
              <button
                type="button"
                className={`btn btn-sm ${role === 'HR_ADMIN' ? 'btn-accent' : 'btn-outline-light'}`}
                onClick={() => switchRole('HR_ADMIN')}
              >
                HR Admin
              </button>
              <button
                type="button"
                className={`btn btn-sm ${role === 'MANAGER' ? 'btn-accent' : 'btn-outline-light'}`}
                onClick={() => switchRole('MANAGER')}
              >
                Manager
              </button>
              <button
                type="button"
                className={`btn btn-sm ${role === 'EMPLOYEE' ? 'btn-accent' : 'btn-outline-light'}`}
                onClick={() => switchRole('EMPLOYEE')}
              >
                Employee
              </button>
            </div>

            {/* Backend API status badge */}
            <span
              className="badge ms-2"
              style={{
                backgroundColor: apiStatus === 'online' ? '#198754' : apiStatus === 'checking' ? '#6C757D' : '#DC3545',
                fontSize: '0.7rem'
              }}
              title="Backend Express API Connection Status"
            >
              API: {apiStatus}
            </span>
          </div>

          {/* Right User Actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="text-white position-relative text-decoration-none touch-target"
              aria-label="Notifications (3 unread)"
            >
              🔔
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                3
              </span>
            </Link>

            {/* User Profile Summary */}
            {currentUser ? (
              <div className="dropdown">
                <button
                  className="btn btn-sm text-white d-flex align-items-center gap-2 dropdown-toggle border-0"
                  type="button"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span
                    className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '32px', height: '32px', backgroundColor: 'var(--ss-color-secondary)' }}
                  >
                    {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                  </span>
                  <span className="d-none d-sm-inline small">
                    {currentUser.firstName} ({currentUser.role})
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userMenuButton">
                  <li>
                    <h6 className="dropdown-header">
                      {currentUser.firstName} {currentUser.lastName}
                    </h6>
                  </li>
                  <li>
                    <span className="dropdown-item-text text-muted small">
                      {currentUser.designation}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      👤 My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/attendance" className="dropdown-item">
                      ⏰ My Attendance
                    </Link>
                  </li>
                  <li>
                    <Link to="/leaves" className="dropdown-item">
                      📅 My Leaves
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      🚪 Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-sm btn-accent">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

