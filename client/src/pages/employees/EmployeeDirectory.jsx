import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import Employee3DCard from '../../components/employees/Employee3DCard.jsx';
import { exportToCSV } from '../../utils/csvExport.js';
import { employeeService } from '../../api/employeeService.js';
import { departmentService } from '../../api/departmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const EmployeeDirectory = () => {
  const { role } = useAuth();
  const [searchParams] = useSearchParams();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(() => {
    return searchParams.get('dept') || searchParams.get('department') || 'ALL';
  });
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (3D cards) or 'table'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'code', 'dept'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  // Sync selectedDept if URL search params change
  useEffect(() => {
    const deptParam = searchParams.get('dept') || searchParams.get('department');
    if (deptParam && deptParam !== selectedDept) {
      setSelectedDept(deptParam);
    }
  }, [searchParams]);

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
    const handler = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(handler);
  }, [fetchEmployees]);

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate employee record for ${name}?`)) {
      return;
    }

    setDeactivatingId(id);
    try {
      await employeeService.deactivate(id);
      await fetchEmployees();
    } catch (err) {
      alert(`Deactivation failed: ${err.message || 'Server error'}`);
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'employeeCode', label: 'Employee Code' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'designation', label: 'Designation' },
      { key: 'departmentId.name', label: 'Department' },
      { key: 'status', label: 'Status' },
      { key: 'employmentType', label: 'Employment Type' },
      { key: 'dateOfJoining', label: 'Date Joined' }
    ];
    exportToCSV(`staffsync-directory-${new Date().toISOString().split('T')[0]}.csv`, sortedEmployees, columns);
  };

  // Sort employee records client-side
  const sortedEmployees = [...employees].sort((a, b) => {
    if (sortBy === 'code') {
      return (a.employeeCode || '').localeCompare(b.employeeCode || '');
    }
    if (sortBy === 'dept') {
      const aDept = a.departmentId?.name || '';
      const bDept = b.departmentId?.name || '';
      return aDept.localeCompare(bDept);
    }
    // Default sort by name
    const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
    const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
    return aName.localeCompare(bName);
  });

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        subtitle="Centralized organizational registry with interactive 3D personnel cards, live search, and CSV export."
        breadcrumbs={[{ label: 'Employees', path: '/employees' }]}
        badge={`${employees.length} Staff Records`}
        actionButton={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm shadow-xs d-flex align-items-center gap-1.5"
              onClick={handleExportCSV}
              disabled={employees.length === 0}
              title="Download personnel directory as CSV"
            >
              <Icon name="reports" size={14} />
              <span>Export CSV</span>
            </button>

            {role === 'HR_ADMIN' && (
              <Link to="/employees/create" className="btn btn-accent btn-sm shadow-sm d-flex align-items-center gap-1.5">
                <Icon name="user-plus" size={16} />
                <span>Onboard Employee</span>
              </Link>
            )}
          </div>
        }
      />

      {/* Filter and Search Bar Card */}
      <div className="ss-card p-3 p-md-4 mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Icon name="search" size={16} color="#64748B" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search staff by name, email, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search employees"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Department Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
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

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
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

          {/* Sort By Dropdown */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort employees"
            >
              <option value="name">Sort by Name</option>
              <option value="code">Sort by Code</option>
              <option value="dept">Sort by Department</option>
            </select>
          </div>

          {/* View Mode Switcher (3D Cards vs Table) */}
          <div className="col-6 col-md-2 d-flex justify-content-end align-items-center gap-1">
            <div className="btn-group btn-group-sm p-1 bg-light border rounded-3 w-100" role="group" aria-label="View Mode">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-light border-0 text-muted'} py-1 flex-fill`}
                onClick={() => setViewMode('grid')}
                title="Interactive 3D Profile Cards"
              >
                <Icon name="dashboard" size={14} />
                <span className="ms-1 d-none d-sm-inline">3D Cards</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-light border-0 text-muted'} py-1 flex-fill`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <Icon name="inbox" size={14} />
                <span className="ms-1 d-none d-sm-inline">Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <Icon name="alert-circle" size={18} />
            <span>{error}</span>
          </div>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchEmployees}>
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="ss-card p-5 text-center my-4">
          <LoadingSpinner label="Querying employee directory from MongoDB Atlas..." size="md" />
        </div>
      ) : sortedEmployees.length === 0 ? (
        /* Empty state */
        <div className="ss-card p-5 my-4">
          <EmptyState
            icon="users"
            title="No Staff Records Found"
            message={
              searchTerm || selectedDept !== 'ALL' || selectedStatus !== 'ALL'
                ? 'No staff members match the selected search or filter criteria. Try resetting filters.'
                : 'No employees have been onboarded yet. Use the "Onboard Employee" button to register your first staff member.'
            }
            action={
              role === 'HR_ADMIN' ? (
                <Link to="/employees/create" className="btn btn-accent btn-sm shadow-sm">
                  <Icon name="user-plus" size={16} />
                  <span>Onboard First Employee</span>
                </Link>
              ) : null
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        /* Interactive 3D Card Grid View */
        <div className="row g-4">
          {sortedEmployees.map((emp) => (
            <div key={emp._id || emp.id} className="col-12 col-md-6 col-xl-4">
              <Employee3DCard
                employee={emp}
                role={role}
                onDeactivate={handleDeactivate}
                isDeactivating={deactivatingId === (emp._id || emp.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Data Table View */
        <div className="ss-card p-0 overflow-hidden shadow-sm">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
            <span className="fw-semibold text-muted small">
              Showing <strong className="text-dark">{sortedEmployees.length}</strong> personnel
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col" className="ps-4">Code</th>
                  <th scope="col">Staff Member</th>
                  <th scope="col">Designation</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map((emp) => {
                  const empId = emp._id || emp.id;
                  const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.fullName || 'Unnamed Staff';
                  const email = emp.userId?.email || emp.email || 'No email';
                  const deptName = emp.departmentId?.name || (typeof emp.departmentId === 'string' ? emp.departmentId : 'Unassigned');
                  const initials = `${(emp.firstName?.[0] || 'U')}${(emp.lastName?.[0] || '')}`.toUpperCase();

                  return (
                    <tr key={empId}>
                      <td className="ps-4">
                        <span className="badge bg-light text-primary border font-monospace px-2 py-1">
                          {emp.employeeCode}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                            style={{
                              width: '34px',
                              height: '34px',
                              backgroundColor: '#1E293B',
                              fontSize: '0.75rem'
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                              {fullName}
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              {email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-dark fw-medium">{emp.designation || 'Staff'}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border">
                          {deptName}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-1.5 align-items-center">
                          <Link to={`/employees/${empId}`} className="btn btn-sm btn-outline-primary py-1 px-2.5">
                            <Icon name="eye" size={14} />
                            <span>View</span>
                          </Link>
                          {role === 'HR_ADMIN' && emp.status !== 'INACTIVE' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger py-1 px-2.5"
                              disabled={deactivatingId === empId}
                              onClick={() => handleDeactivate(empId, fullName)}
                              title="Deactivate employee record"
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
