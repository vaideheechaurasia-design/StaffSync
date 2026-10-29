import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { healthService } from '../../api/healthService.js';
import leaveService from '../../api/leaveService.js';
import Icon from '../common/Icon.jsx';
import CommandPalette from '../common/CommandPalette.jsx';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('checking');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

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

  // Compute live unread notification count
  useEffect(() => {
    let isMounted = true;
    const computeUnread = async () => {
      try {
        let count = 0;
        if (role === 'HR_ADMIN' || role === 'MANAGER') {
          const pending = await leaveService.getPendingApprovals().catch(() => ({ data: [] }));
          if (pending?.data) count += pending.data.length;
        }
        if (isMounted) setUnreadNotifsCount(count);
      } catch (_) {}
    };

    computeUnread();
    window.addEventListener('staffsync_notifications_updated', computeUnread);
    return () => {
      isMounted = false;
      window.removeEventListener('staffsync_notifications_updated', computeUnread);
    };
  }, [role]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels = {
    HR_ADMIN: 'HR Administrator',
    MANAGER: 'Department Manager',
    EMPLOYEE: 'Staff Member'
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="navbar navbar-expand-lg ss-topbar px-3 px-md-4 sticky-top" aria-label="Top Header">
        <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
          {/* Left Brand & Sidebar Toggle */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-lg-none touch-target p-2"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
            >
              <Icon name="menu" size={20} />
            </button>

            <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2 mb-0 me-3">
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
                <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em' }}>
                  StaffSync
                </span>
                <span
                  className="badge ms-2 fw-semibold d-none d-sm-inline-block"
                  style={{
                    backgroundColor: '#EEF2FF',
                    color: '#4F46E5',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.04em'
                  }}
                >
                  ENTERPRISE
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Trigger, Live System Diagnostics & Role Badge */}
          <div className="d-none d-md-flex align-items-center gap-2.5">
            {/* Quick Command Palette Button */}
            <button
              type="button"
              className="btn btn-sm btn-light border d-flex align-items-center gap-2 px-3 py-1.5 text-muted rounded-pill shadow-xs"
              onClick={() => setIsPaletteOpen(true)}
              style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontSize: '0.8125rem' }}
              title="Search staff and commands (Ctrl + K)"
            >
              <Icon name="search" size={14} color="#64748B" />
              <span>Search...</span>
              <kbd className="bg-white border text-secondary px-1.5 py-0.5 rounded shadow-2xs font-monospace" style={{ fontSize: '0.6875rem' }}>
                Ctrl K
              </kbd>
            </button>

            {/* Live Database status pill */}
            <div
              className="d-inline-flex align-items-center gap-2 px-2.5 py-1 rounded-pill border"
              style={{
                backgroundColor: apiStatus === 'online' ? '#ECFDF5' : '#FEF2F2',
                borderColor: apiStatus === 'online' ? '#A7F3D0' : '#FECACA',
                fontSize: '0.75rem',
                color: apiStatus === 'online' ? '#065F46' : '#991B1B'
              }}
              title="MongoDB Atlas and Express API live connection status"
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: apiStatus === 'online' ? '#10B981' : '#EF4444',
                  boxShadow: apiStatus === 'online' ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              />
              <span className="fw-medium">
                {apiStatus === 'online' ? 'MongoDB Atlas Live' : apiStatus === 'checking' ? 'Connecting...' : 'API Offline'}
              </span>
            </div>

            {/* Role indicator */}
            <span
              className="badge px-2.5 py-1 fw-semibold text-secondary border bg-light"
              style={{ fontSize: '0.75rem' }}
            >
              {roleLabels[role] || role || 'Staff Member'}
            </span>
          </div>

          {/* Right: Notifications & User Profile Menu */}
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            {/* Quick Actions / Notifications Link */}
            <Link
              to="/notifications"
              className="btn btn-sm btn-outline-secondary p-2 position-relative touch-target border-0"
              style={{ color: '#475569' }}
              aria-label="Notifications"
            >
              <Icon name="bell" size={19} />
              {unreadNotifsCount > 0 && (
                <span
                  className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{
                    fontSize: '0.625rem',
                    padding: '2px 5px'
                  }}
                >
                  {unreadNotifsCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            {currentUser ? (
              <div className="dropdown">
                <button
                  className="btn btn-sm d-flex align-items-center gap-2 p-1 border-0 bg-transparent"
                  type="button"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                      fontSize: '0.85rem'
                    }}
                  >
                    {currentUser.initials || `${currentUser.firstName?.[0] || 'U'}`}
                  </div>
                  <div className="d-none d-md-block text-start lh-sm me-1">
                    <div className="fw-semibold text-dark" style={{ fontSize: '0.8125rem' }}>
                      {currentUser.firstName || currentUser.name}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {currentUser.role}
                    </div>
                  </div>
                  <Icon name="chevron-down" size={14} color="#64748B" />
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-lg" aria-labelledby="userMenuButton" style={{ minWidth: '220px' }}>
                  <li className="px-3 py-2 border-bottom">
                    <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                      {currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`.trim()}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {currentUser.email}
                    </div>
                  </li>
                  <li className="mt-1">
                    <Link to="/profile" className="dropdown-item py-2">
                      <Icon name="user" size={16} color="#64748B" />
                      <span>My Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/attendance" className="dropdown-item py-2">
                      <Icon name="clock" size={16} color="#64748B" />
                      <span>My Attendance</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/leaves" className="dropdown-item py-2">
                      <Icon name="calendar" size={16} color="#64748B" />
                      <span>My Leaves</span>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <Icon name="log-out" size={16} color="#DC2626" />
                      <span>Sign Out</span>
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

      {/* Global Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
};

export default Navbar;
