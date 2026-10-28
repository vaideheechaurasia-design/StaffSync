import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { role } = useAuth();

  // Navigation configurations based on approved UI_UX_BLUEPRINT.md Section 2
  const NAV_ITEMS = {
    HR_ADMIN: [
      { label: 'HR Dashboard', path: '/dashboard/hr', icon: '📊' },
      { label: 'Employees', path: '/employees', icon: '👥' },
      { label: 'Departments', path: '/departments', icon: '🏢' },
      { label: 'Company Attendance', path: '/attendance/admin', icon: '⏰' },
      { label: 'Leave Approvals', path: '/leaves/approvals', icon: '📬' },
      { label: 'Announcements', path: '/announcements', icon: '📢' },
      { label: 'Training Programs', path: '/training', icon: '🎓' },
      { label: 'HR Reports', path: '/reports', icon: '📈' },
      { label: 'My Personal Portal', path: '/dashboard/employee', icon: '💼' }
    ],
    MANAGER: [
      { label: 'Manager Dashboard', path: '/dashboard/manager', icon: '📊' },
      { label: 'Team Attendance', path: '/attendance/team', icon: '⏰' },
      { label: 'Leave Approvals', path: '/leaves/approvals', icon: '📬' },
      { label: 'Department Staff', path: '/employees', icon: '👥' },
      { label: 'Departments', path: '/departments', icon: '🏢' },
      { label: 'My Attendance', path: '/attendance', icon: '⏱️' },
      { label: 'My Leaves', path: '/leaves', icon: '📅' },
      { label: 'Announcements', path: '/announcements', icon: '📢' },
      { label: 'Training Catalog', path: '/training', icon: '🎓' }
    ],
    EMPLOYEE: [
      { label: 'My Dashboard', path: '/dashboard/employee', icon: '📊' },
      { label: 'Daily Attendance', path: '/attendance', icon: '⏰' },
      { label: 'My Leaves', path: '/leaves', icon: '📅' },
      { label: 'Apply for Leave', path: '/leaves/apply', icon: '➕' },
      { label: 'Staff Directory', path: '/employees', icon: '👥' },
      { label: 'Announcements', path: '/announcements', icon: '📢' },
      { label: 'Training Catalog', path: '/training', icon: '🎓' }
    ]
  };

  const currentNavItems = NAV_ITEMS[role] || NAV_ITEMS.EMPLOYEE;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar-nav"
        className={`ss-sidebar d-flex flex-column py-3 ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'd-block position-fixed top-0 start-0 h-100 z-3' : 'd-none d-lg-flex'
        }`}
        style={{ zIndex: 1045 }}
        aria-label="Sidebar Navigation"
      >
        {/* Mobile Header */}
        <div className="d-flex justify-content-between align-items-center px-3 mb-3 d-lg-none">
          <span className="fw-bold" style={{ color: 'var(--ss-color-primary)' }}>
            Navigation
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Role Scope Indicator */}
        <div className="px-3 mb-2">
          <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            {role === 'HR_ADMIN' ? 'HR / Admin Portal' : role === 'MANAGER' ? 'Manager Portal' : 'Employee Portal'}
          </span>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-grow-1" aria-label="Role Links">
          <ul className="list-unstyled mb-0">
            {currentNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `ss-nav-item ${isActive ? 'active' : ''}`}
                  onClick={onCloseMobile}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="px-3 pt-3 border-top mt-auto" style={{ fontSize: '0.75rem', color: 'var(--ss-color-text-muted)' }}>
          <p className="mb-0 fw-semibold">StaffSync HRMS</p>
          <p className="mb-0">Phase 4 Foundation</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

