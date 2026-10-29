import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import employeeService from '../../api/employeeService.js';
import departmentService from '../../api/departmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Load employees and departments
      Promise.all([
        employeeService.getAll().catch(() => ({ data: [] })),
        departmentService.getAll().catch(() => ({ data: [] }))
      ]).then(([empRes, deptRes]) => {
        if (empRes?.data) setEmployees(empRes.data);
        if (deptRes?.data) setDepartments(deptRes.data);
      });
    }
  }, [isOpen]);

  // Global keydown handler for Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Navigation Items
  const standardPages = [
    { label: 'Executive HR Dashboard', path: '/dashboard/hr', icon: 'dashboard', roles: ['HR_ADMIN'] },
    { label: 'Manager Team Portal', path: '/dashboard/manager', icon: 'briefcase', roles: ['MANAGER', 'HR_ADMIN'] },
    { label: 'My Employee Workspace', path: '/dashboard/employee', icon: 'user', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'Employee Directory', path: '/employees', icon: 'users', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'Onboard New Employee', path: '/employees/create', icon: 'user-plus', roles: ['HR_ADMIN'] },
    { label: 'Department Structure', path: '/departments', icon: 'building', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'Live Attendance Monitor', path: '/attendance/admin', icon: 'clock', roles: ['HR_ADMIN'] },
    { label: 'My Attendance Logs', path: '/attendance', icon: 'clock', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'Leave Request Approvals', path: '/leaves/approvals', icon: 'inbox', roles: ['MANAGER', 'HR_ADMIN'] },
    { label: 'Apply for Leave', path: '/leaves/apply', icon: 'calendar', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'My Leave Balances', path: '/leaves', icon: 'calendar-check', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'HR Analytics & Reports', path: '/reports', icon: 'bar-chart', roles: ['HR_ADMIN'] },
    { label: 'Company Announcements', path: '/announcements', icon: 'megaphone', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'Training Catalog', path: '/training', icon: 'graduation-cap', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
    { label: 'My Profile & Security', path: '/profile', icon: 'lock', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] }
  ];

  const allowedPages = standardPages.filter((item) => !item.roles || item.roles.includes(role));

  const filteredPages = query.trim()
    ? allowedPages.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allowedPages.slice(0, 6);

  const filteredEmployees = query.trim()
    ? employees.filter((emp) => {
        const full = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.employeeCode || ''} ${emp.workEmail || ''}`.toLowerCase();
        return full.includes(query.toLowerCase());
      }).slice(0, 5)
    : [];

  const filteredDepartments = query.trim()
    ? departments.filter((dept) => {
        const full = `${dept.name || ''} ${dept.code || ''}`.toLowerCase();
        return full.includes(query.toLowerCase());
      }).slice(0, 4)
    : [];

  const allResults = [
    ...filteredPages.map((p) => ({ ...p, type: 'page' })),
    ...filteredDepartments.map((d) => ({
      label: d.name,
      sublabel: `Department Code: ${d.code}`,
      path: '/departments',
      icon: 'building',
      type: 'department'
    })),
    ...filteredEmployees.map((e) => ({
      label: `${e.firstName} ${e.lastName}`,
      sublabel: `${e.employeeCode || '—'} • ${e.departmentId?.name || e.designation || 'Staff'}`,
      path: `/employees/${e._id || e.id}`,
      icon: 'user',
      type: 'employee'
    }))
  ];

  const handleSelect = (item) => {
    onClose();
    if (item.action === 'logout') {
      logout();
      navigate('/login');
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center pt-5"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="w-100 overflow-hidden shadow-2xl bg-white"
        style={{
          maxWidth: '620px',
          maxHeight: '480px',
          borderRadius: '16px',
          border: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="d-flex align-items-center px-3 py-3 border-bottom gap-2 bg-light">
          <Icon name="search" size={20} color="#64748B" />
          <input
            ref={inputRef}
            type="text"
            className="form-control border-0 bg-transparent shadow-none fs-6"
            placeholder="Type a command, employee name, or destination..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            style={{ outline: 'none' }}
          />
          <span className="badge bg-white text-secondary border font-monospace px-2 py-1" style={{ fontSize: '0.75rem' }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2" style={{ maxHeight: '380px' }}>
          {allResults.length === 0 ? (
            <div className="py-5 text-center text-muted small">
              <Icon name="alert-circle" size={24} color="#94A3B8" className="mb-2" />
              <div>No results matching "{query}".</div>
            </div>
          ) : (
            <>
              {filteredPages.length > 0 && (
                <div className="px-3 py-1.5 text-uppercase fw-bold text-muted" style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>
                  Navigation & Tools
                </div>
              )}
              {filteredPages.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`w-100 text-start border-0 rounded-2 px-3 py-2 d-flex align-items-center justify-content-between mb-1 ${
                      isSelected ? 'bg-primary text-white' : 'bg-white text-dark hover-bg-light'
                    }`}
                    style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      <Icon
                        name={item.icon || 'arrow-right'}
                        size={17}
                        color={isSelected ? '#FFFFFF' : '#4F46E5'}
                      />
                      <span className="fw-medium" style={{ fontSize: '0.875rem' }}>
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`small font-monospace ${isSelected ? 'text-white-50' : 'text-muted'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {item.path}
                    </span>
                  </button>
                );
              })}

              {filteredEmployees.length > 0 && (
                <>
                  <div className="px-3 py-1.5 mt-2 text-uppercase fw-bold text-muted border-top pt-2" style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>
                    Staff Members
                  </div>
                  {filteredEmployees.map((emp, empIdx) => {
                    const totalIdx = filteredPages.length + empIdx;
                    const isSelected = selectedIndex === totalIdx;
                    const fullName = `${emp.firstName} ${emp.lastName}`;
                    const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`;

                    return (
                      <button
                        key={emp._id || emp.id}
                        type="button"
                        className={`w-100 text-start border-0 rounded-2 px-3 py-2 d-flex align-items-center justify-content-between mb-1 ${
                          isSelected ? 'bg-primary text-white' : 'bg-white text-dark hover-bg-light'
                        }`}
                        style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                        onClick={() => handleSelect({ path: `/employees/${emp._id || emp.id}` })}
                        onMouseEnter={() => setSelectedIndex(totalIdx)}
                      >
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                              isSelected ? 'bg-white text-primary' : 'bg-dark text-white'
                            }`}
                            style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                              {fullName}
                            </div>
                            <div className={`small ${isSelected ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                              {emp.employeeCode || '—'} • {emp.departmentId?.name || 'Staff'}
                            </div>
                          </div>
                        </div>
                        <Icon name="chevron-right" size={14} color={isSelected ? '#FFFFFF' : '#94A3B8'} />
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-2.5 border-top bg-light d-flex justify-content-between align-items-center small text-muted px-3" style={{ fontSize: '0.75rem' }}>
          <div className="d-flex align-items-center gap-3">
            <span><kbd className="bg-white border text-dark px-1.5 py-0.5 rounded">↑</kbd> <kbd className="bg-white border text-dark px-1.5 py-0.5 rounded">↓</kbd> navigate</span>
            <span><kbd className="bg-white border text-dark px-1.5 py-0.5 rounded">↵</kbd> select</span>
          </div>
          <span>StaffSync Command Bar</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
