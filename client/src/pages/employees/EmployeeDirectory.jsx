import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const EmployeeDirectory = () => {
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const SAMPLE_EMPLOYEES = [
    { id: 'emp-1', code: 'EMP-1001', name: 'Eleanor Vance', role: 'Director of HR', dept: 'Human Resources', email: 'admin@staffsync.internal', status: 'ACTIVE' },
    { id: 'emp-2', code: 'EMP-1002', name: 'Marcus Brody', role: 'Engineering Lead', dept: 'Engineering', email: 'manager@staffsync.internal', status: 'ACTIVE' },
    { id: 'emp-3', code: 'EMP-1003', name: 'Jane Doe', role: 'Software Engineer', dept: 'Engineering', email: 'employee@staffsync.internal', status: 'ACTIVE' },
    { id: 'emp-4', code: 'EMP-1004', name: 'David Kim', role: 'Marketing Specialist', dept: 'Sales & Marketing', email: 'david@staffsync.internal', status: 'ACTIVE' },
    { id: 'emp-5', code: 'EMP-1005', name: 'Sarah Connor', role: 'Operations Analyst', dept: 'Operations', email: 'sarah@staffsync.internal', status: 'ON_LEAVE' },
    { id: 'emp-6', code: 'EMP-1006', name: 'Arthur Pendelton', role: 'Former Consultant', dept: 'Engineering', email: 'arthur@staffsync.internal', status: 'INACTIVE' }
  ];

  const filteredEmployees = SAMPLE_EMPLOYEES.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        subtitle="Search and browse staff records, departmental alignments, and organizational contacts."
        breadcrumbs={[{ label: 'Employees', path: '/employees' }]}
        actionButton={
          role === 'HR_ADMIN' ? (
            <Link to="/employees/create" className="btn btn-accent btn-sm">
              ➕ Onboard New Employee
            </Link>
          ) : null
        }
      />

      <PlaceholderNotice
        featureName="Employee Lifecycle & Directory"
        targetPhase="Phase 7 (Employee & Department Management)"
        description="The directory below displays the approved search, filter, and tabular layout. MongoDB queries, pagination, and backend role scoping will connect in Phase 7."
      />

      {/* Filter & Search Bar */}
      <div className="ss-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search staff by name, code (EMP-1001), or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search employee directory"
            />
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div className="col-12 col-md-2 text-md-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => { setSearchTerm(''); setSelectedDept('ALL'); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="ss-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th scope="col" className="ps-3">Code</th>
                <th scope="col">Name & Email</th>
                <th scope="col">Designation</th>
                <th scope="col">Department</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td className="ps-3 font-monospace fw-semibold">{emp.code}</td>
                  <td>
                    <div className="fw-bold" style={{ color: 'var(--ss-color-primary)' }}>
                      {emp.name}
                    </div>
                    <div className="small text-muted">{emp.email}</div>
                  </td>
                  <td>{emp.role}</td>
                  <td>{emp.dept}</td>
                  <td><StatusBadge status={emp.status} /></td>
                  <td className="text-end pe-3">
                    <Link to={`/employees/${emp.id}`} className="btn btn-sm btn-outline-primary py-0">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDirectory;

