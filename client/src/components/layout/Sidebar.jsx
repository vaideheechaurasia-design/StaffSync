import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../common/Icon.jsx';

export const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { role, currentUser, logout } = useAuth();

  // Categorized navigation groups with modern vector icon identifiers
  const NAV_SECTIONS = {
    HR_ADMIN: [
      {
        title: 'Core Governance',
        items: [
          { label: 'HR Executive Dashboard', path: '/dashboard/hr', icon: 'dashboard' },
          { label: 'Employee Directory', path: '/employees', icon: 'users' },
          { label: 'Departments', path: '/departments', icon: 'building' },
          { label: 'Company Attendance', path: '/attendance/admin', icon: 'clock' },
          { label: 'Leave Approvals', path: '/leaves/approvals', icon: 'inbox' }
        ]
      },
      {
        title: 'Workforce Operations',
        items: [
          { label: 'Announcements', path: '/announcements', icon: 'megaphone' },
          { label: 'Training Catalog', path: '/training', icon: 'graduation-cap' },
          { label: 'HR Analytics & Reports', path: '/reports', icon: 'bar-chart' }
        ]
      },
      {
        title: 'Personal Portal',
        items: [
          { label: 'My Self-Service', path: '/dashboard/employee', icon: 'briefcase' },
          { label: 'My Attendance', path: '/attendance', icon: 'calendar-check' },
          { label: 'My Leaves', path: '/leaves', icon: 'calendar' }
        ]
      }
    ],
    MANAGER: [
      {
        title: 'Team Management',
        items: [
          { label: 'Manager Dashboard', path: '/dashboard/manager', icon: 'dashboard' },
          { label: 'Team Attendance', path: '/attendance/team', icon: 'clock' },
          { label: 'Leave Decisions', path: '/leaves/approvals', icon: 'inbox' },
          { label: 'Department Staff', path: '/employees', icon: 'users' },
          { label: 'Departments', path: '/departments', icon: 'building' }
        ]
      },
      {
        title: 'Personal Space',
        items: [
          { label: 'My Attendance', path: '/attendance', icon: 'calendar-check' },
          { label: 'My Leaves', path: '/leaves', icon: 'calendar' },
          { label: 'Announcements', path: '/announcements', icon: 'megaphone' },
          { label: 'Training Programs', path: '/training', icon: 'graduation-cap' }
        ]
      }
    ],
    EMPLOYEE: [
      {
        title: 'My Workspace',
        items: [
          { label: 'Self-Service Dashboard', path: '/dashboard/employee', icon: 'dashboard' },
          { label: 'Daily Punch & Attendance', path: '/attendance', icon: 'clock' },
          { label: 'My Leave History', path: '/leaves', icon: 'calendar' },
          { label: 'Apply for Leave', path: '/leaves/apply', icon: 'plus' }
        ]
      },
      {
        title: 'Organization',
        items: [
          { label: 'Staff Directory', path: '/employees', icon: 'users' },
          { label: 'Announcements', path: '/announcements', icon: 'megaphone' },
          { label: 'Training Programs', path: '/training', icon: 'graduation-cap' }
        ]
      }
    ]
  };

  const sections = NAV_SECTIONS[role] || NAV_SECTIONS.EMPLOYEE;

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
        {/* Mobile Header with Close Button */}
        <div className="d-flex justify-content-between align-items-center px-3 mb-2 d-lg-none">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center text-white"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--ss-color-accent-gradient)'
              }}
            >
              <Icon name="sparkles" size={14} color="#ffffff" />
            </div>
            <span className="fw-bold fs-6 text-dark">StaffSync</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-grow-1 overflow-y-auto">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-3">
              {!isCollapsed && (
                <div className="ss-sidebar-section-title">
                  {section.title}
                </div>
              )}
              <nav className="nav flex-column">
                {section.items.map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.path}
                    className={({ isActive }) =>
                      `ss-nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => {
                      if (isMobileOpen && onCloseMobile) onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon name={item.icon} size={18} />
                    {!isCollapsed && (
                      <span className="text-truncate">{item.label}</span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom User Account Card */}
        {currentUser && !isCollapsed && (
          <div className="px-3 pt-3 mt-auto border-top">
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
              <div className="d-flex align-items-center gap-2 text-truncate">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#1E293B',
                    fontSize: '0.75rem'
                  }}
                >
                  {currentUser.initials || `${currentUser.firstName?.[0] || 'U'}`}
                </div>
                <div className="text-truncate lh-sm" style={{ maxWidth: '140px' }}>
                  <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.8125rem' }}>
                    {currentUser.firstName || currentUser.name}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1 border-0 text-muted hover-danger"
                onClick={logout}
                title="Sign out of StaffSync"
              >
                <Icon name="log-out" size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
