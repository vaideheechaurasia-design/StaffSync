import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { employeeService } from '../../api/employeeService.js';
import { departmentService } from '../../api/departmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const EmployeeDirectory = () => {
  const { role } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  // Load departments for filter dropdown
  useEffect(() => {
    departmentService.getAll()
      .then((res) => {
        if (res && res.data) {
          setDepartments(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not load departments filter list:', err.message);
      });
  }, []);

  // Fetch employees from live backend API
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const response = await employeeService.getAll(params);
      if (response && response.data) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load employee records from server.');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDept, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 250); // Small debounce for responsive search

    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const handleDeactivate = async (empId, empName) => {
    const confirmed = window.confirm(`Are you sure you want to deactivate employee "${empName}"? Their portal access will be suspended.`);
    if (!confirmed) return;

    setDeactivatingId(empId);
    try {
      await employeeService.delete(empId);
      await fetchEmployees();
    } catch (err) {
      alert(`Deactivation failed: ${err.message}`);
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        subtitle="Search and browse staff records, departmental alignments, and organizational contacts."
        breadcrumbs={[{ label: 'Employees', path: '/employees' }]}
        actionButton={
          role === 'HR_ADMIN' ? (
            <Link to="/employees/create" className="btn btn-accent btn-sm d-flex align-items-center gap-1">
              <span>➕</span> Onboard New Employee
            </Link>
          ) : null
        }
      />

      {/* Filter & Search Bar */}
      <div className="ss-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search staff by name, code (EMP-1001), or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search employee directory"
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id || dept.id} value={dept._id || dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="col-12 col-md-2 text-md-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('ALL');
                setSelectedStatus('ALL');
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchEmployees}>
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="ss-card p-5 text-center">
          <LoadingSpinner label="Fetching staff records from MongoDB..." size="md" />
        </div>
      ) : employees.length === 0 ? (
        /* Empty state */
        <div className="ss-card p-5">
          <EmptyState
            icon="👥"
            title="No Staff Records Found"
            message={
              searchTerm || selectedDept !== 'ALL' || selectedStatus !== 'ALL'
                ? 'No employees match the selected search or filter criteria. Try resetting filters.'
                : 'No employees have been onboarded yet. Use the "Onboard New Employee" button to add your first staff member.'
            }
            action={
              role === 'HR_ADMIN' ? (
                <Link to="/employees/create" className="btn btn-accent btn-sm">
                  ➕ Onboard First Employee
                </Link>
              ) : null
            }
          />
        </div>
      ) : (
        /* Data Table */
        <div className="ss-card p-0 overflow-hidden shadow-sm">
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
                {employees.map((emp) => {
                  const empId = emp._id || emp.id;
                  const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.fullName || 'Unnamed Staff';
                  const email = emp.userId?.email || emp.email || 'No email';
                  const deptName = emp.departmentId?.name || (typeof emp.departmentId === 'string' ? emp.departmentId : 'Unassigned');

                  return (
                    <tr key={empId}>
                      <td className="ps-3 font-monospace fw-semibold">{emp.employeeCode}</td>
                      <td>
                        <div className="fw-bold" style={{ color: 'var(--ss-color-primary)' }}>
                          {fullName}
                        </div>
                        <div className="small text-muted">{email}</div>
                      </td>
                      <td>{emp.designation}</td>
                      <td>{deptName}</td>
                      <td>
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-inline-flex gap-1 align-items-center">
                          <Link to={`/employees/${empId}`} className="btn btn-sm btn-outline-primary py-1 px-2" style={{ fontSize: '0.75rem' }}>
                            View Profile
                          </Link>
                          {role === 'HR_ADMIN' && emp.status !== 'INACTIVE' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              style={{ fontSize: '0.75rem' }}
                              disabled={deactivatingId === empId}
                              onClick={() => handleDeactivate(empId, fullName)}
                              title="Deactivate employee account"
                            >
                              {deactivatingId === empId ? '...' : 'Deactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
