import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import Employee3DBadge from '../../components/employees/Employee3DBadge.jsx';
import { employeeService } from '../../api/employeeService.js';
import { departmentService } from '../../api/departmentService.js';
import attendanceService from '../../api/attendanceService.js';
import leaveService from '../../api/leaveService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const EmployeeProfile = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'attendance', 'leaves', 'emergency'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    phone: '',
    departmentId: '',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: ''
  });

  const fetchEmployeeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employeeService.getById(id);
      if (response && response.data) {
        const emp = response.data;
        setEmployee(emp);
        setEditFormData({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          designation: emp.designation || '',
          phone: emp.phone || '',
          departmentId: emp.departmentId?._id || emp.departmentId?.id || emp.departmentId || '',
          status: emp.status || 'ACTIVE',
          employmentType: emp.employmentType || 'FULL_TIME',
          emergencyName: emp.emergencyContact?.name || '',
          emergencyRelationship: emp.emergencyContact?.relationship || '',
          emergencyPhone: emp.emergencyContact?.phone || ''
        });

        // Load employee-specific attendance logs & leave requests if authorized
        if (role === 'HR_ADMIN' || role === 'MANAGER') {
          Promise.allSettled([
            attendanceService.getAllAttendance({ employeeId: id, limit: 10 }),
            leaveService.getAll({ employeeId: id, limit: 10 })
          ]).then(([attRes, leaveRes]) => {
            if (attRes.status === 'fulfilled' && attRes.value?.data) {
              setAttendanceRecords(attRes.value.data);
            }
            if (leaveRes.status === 'fulfilled' && leaveRes.value?.data) {
              setLeaveRecords(leaveRes.value.data);
            }
          });
        }
      } else {
        throw new Error('Employee record not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve employee profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id, role]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  // Load departments for editing dropdown
  useEffect(() => {
    departmentService.getAll()
      .then((res) => {
        if (res && res.data) setDepartments(res.data);
      })
      .catch(() => {});
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        designation: editFormData.designation.trim(),
        phone: editFormData.phone.trim(),
        departmentId: editFormData.departmentId,
        status: editFormData.status,
        employmentType: editFormData.employmentType,
        emergencyContact: {
          name: editFormData.emergencyName.trim(),
          relationship: editFormData.emergencyRelationship.trim(),
          phone: editFormData.emergencyPhone.trim()
        }
      };

      await employeeService.update(employee._id || employee.id, payload);
      setSaveSuccess(true);
      setIsEditing(false);
      await fetchEmployeeData();
    } catch (err) {
      setError(err.message || 'Failed to update employee profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm(`Deactivate employee "${employee.firstName} ${employee.lastName}"? Their user access will be suspended immediately.`);
    if (!confirmed) return;

    try {
      await employeeService.delete(employee._id || employee.id);
      await fetchEmployeeData();
      alert('Employee deactivated successfully.');
    } catch (err) {
      alert(`Deactivation failed: ${err.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="ss-card p-5 text-center my-4">
        <LoadingSpinner label="Loading employee profile..." size="md" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="py-4">
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{error || 'Employee record could not be found.'}</div>
        </div>
        <Link to="/employees" className="btn btn-outline-secondary">
          <Icon name="arrow-left" size={14} />
          <span>Back to Employee Directory</span>
        </Link>
      </div>
    );
  }

  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName;
  const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase() || 'EMP';
  const email = employee.userId?.email || 'N/A';
  const departmentName = employee.departmentId?.name || 'Unassigned';
  const departmentCode = employee.departmentId?.code || 'N/A';
  const hireDate = employee.dateOfJoining ? formatDate(employee.dateOfJoining) : 'N/A';

  return (
    <div>
      <PageHeader
        title="Employee Personnel Record"
        subtitle="Individual personnel file, organizational alignment, attendance trail, and emergency contacts."
        breadcrumbs={[
          { label: 'Employees', path: '/employees' },
          { label: fullName, path: `/employees/${id}` }
        ]}
        actionButton={
          <div className="d-flex gap-2">
            <Link to="/employees" className="btn btn-outline-secondary btn-sm shadow-xs">
              <Icon name="arrow-left" size={14} />
              <span>Back to Directory</span>
            </Link>
            {role === 'HR_ADMIN' && !isEditing && (
              <button
                type="button"
                className="btn btn-accent btn-sm shadow-sm"
                onClick={() => setIsEditing(true)}
              >
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        }
      />

      {saveSuccess && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check-circle" size={18} />
          <div>Employee profile successfully updated in MongoDB Atlas.</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSaveSuccess(false)} aria-label="Close" />
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="ss-card p-4 p-md-5 mb-4 shadow-sm position-relative overflow-hidden">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow flex-shrink-0"
            style={{
              width: '76px',
              height: '76px',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              fontSize: '1.75rem',
              letterSpacing: '0.04em',
              border: '3px solid #EEF2FF'
            }}
          >
            {initials}
          </div>

          <div className="flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
              <h1 className="h3 mb-0 fw-bold" style={{ color: 'var(--ss-color-primary)', letterSpacing: '-0.02em' }}>
                {fullName}
              </h1>
              <span className="badge bg-light text-primary border font-monospace px-2.5 py-1">
                {employee.employeeCode}
              </span>
              <StatusBadge status={employee.status} />
              <span className="badge bg-light text-secondary border font-monospace">
                {employee.employmentType || 'FULL_TIME'}
              </span>
            </div>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              <strong className="text-dark">{employee.designation}</strong> • {departmentName} ({departmentCode}) • Work Email: <strong className="text-dark">{email}</strong>
            </p>
          </div>

          {role === 'HR_ADMIN' && employee.status === 'ACTIVE' && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm align-self-start align-self-md-center"
              onClick={handleDeactivate}
            >
              Deactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Profile Section Tabs */}
      {!isEditing && (
        <div className="d-flex gap-2 mb-4 border-bottom pb-2 overflow-x-auto">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-light border text-muted'} px-3 py-1.5 d-flex align-items-center gap-1.5`}
            onClick={() => setActiveTab('overview')}
          >
            <Icon name="user" size={14} />
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'attendance' ? 'btn-primary' : 'btn-light border text-muted'} px-3 py-1.5 d-flex align-items-center gap-1.5`}
            onClick={() => setActiveTab('attendance')}
          >
            <Icon name="clock" size={14} />
            <span>Attendance Trail ({attendanceRecords.length})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'leaves' ? 'btn-primary' : 'btn-light border text-muted'} px-3 py-1.5 d-flex align-items-center gap-1.5`}
            onClick={() => setActiveTab('leaves')}
          >
            <Icon name="calendar" size={14} />
            <span>Leaves & Quotas ({leaveRecords.length})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'emergency' ? 'btn-primary' : 'btn-light border text-muted'} px-3 py-1.5 d-flex align-items-center gap-1.5`}
            onClick={() => setActiveTab('emergency')}
          >
            <Icon name="phone" size={14} />
            <span>Emergency Contacts</span>
          </button>
        </div>
      )}

      {/* Edit Mode vs View Mode */}
      {isEditing ? (
        <div className="ss-card p-4 p-md-5 shadow-sm">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h2 className="h5 fw-bold mb-0 text-dark">Edit Employee Details</h2>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveUpdate}>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={editFormData.firstName}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={editFormData.lastName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Designation / Title *</label>
                <input
                  type="text"
                  name="designation"
                  className="form-control"
                  value={editFormData.designation}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Department *</label>
                <select
                  name="departmentId"
                  className="form-select"
                  value={editFormData.departmentId}
                  onChange={handleEditChange}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept._id || dept.id} value={dept._id || dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Employment Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={editFormData.status}
                  onChange={handleEditChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Employment Type</label>
                <select
                  name="employmentType"
                  className="form-select"
                  value={editFormData.employmentType}
                  onChange={handleEditChange}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>

              <div className="col-12 mt-4">
                <h3 className="h6 fw-bold text-uppercase text-muted border-bottom pb-2">Emergency Contact</h3>
              </div>
              <div className="col-md-4">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  className="form-control"
                  value={editFormData.emergencyName}
                  onChange={handleEditChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  name="emergencyRelationship"
                  className="form-control"
                  value={editFormData.emergencyRelationship}
                  onChange={handleEditChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  className="form-control"
                  value={editFormData.emergencyPhone}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-accent px-4 shadow-sm"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'overview' ? (
        /* Overview Tab with 3D Security Credential Badge */
        <div className="row g-4 align-items-start">
          {/* Interactive 3D Credential Badge Column */}
          <div className="col-12 col-xl-4 d-flex flex-column align-items-center">
            <div className="small text-muted fw-bold text-uppercase mb-2 text-center" style={{ letterSpacing: '0.06em', fontSize: '0.75rem' }}>
              <Icon name="sparkles" size={13} className="me-1 text-warning" />
              Interactive 3D Personnel Credential
            </div>
            <Employee3DBadge employee={employee} />
            <div className="text-muted text-center mt-2" style={{ fontSize: '0.75rem' }}>
              Tilt with cursor or touch • Hardware accelerated
            </div>
          </div>

          {/* Organizational & Personnel Information Details */}
          <div className="col-12 col-xl-8">
            <div className="row g-4">
              <div className="col-12 col-lg-6">
                <div className="ss-card p-4 h-100 shadow-sm">
                  <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
                    <Icon name="building" size={18} color="#4F46E5" />
                    <h2 className="h6 fw-bold text-uppercase text-dark mb-0">
                      Job & Organizational Parameters
                    </h2>
                  </div>
                  <dl className="row mb-0" style={{ fontSize: '0.875rem' }}>
                    <dt className="col-sm-5 text-muted">Employee Code</dt>
                    <dd className="col-sm-7 font-monospace fw-semibold">{employee.employeeCode}</dd>

                    <dt className="col-sm-5 text-muted">Official Title</dt>
                    <dd className="col-sm-7 fw-semibold text-dark">{employee.designation}</dd>

                    <dt className="col-sm-5 text-muted">Department</dt>
                    <dd className="col-sm-7">{departmentName} ({departmentCode})</dd>

                    <dt className="col-sm-5 text-muted">Date of Joining</dt>
                    <dd className="col-sm-7">{hireDate}</dd>

                    <dt className="col-sm-5 text-muted">Employment Type</dt>
                    <dd className="col-sm-7 font-monospace">{employee.employmentType || 'FULL_TIME'}</dd>

                    <dt className="col-sm-5 text-muted">Account Status</dt>
                    <dd className="col-sm-7">
                      <StatusBadge status={employee.status} />
                    </dd>
                  </dl>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="ss-card p-4 h-100 shadow-sm">
                  <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
                    <Icon name="phone" size={18} color="#4F46E5" />
                    <h2 className="h6 fw-bold text-uppercase text-dark mb-0">
                      Contact & Personnel Details
                    </h2>
                  </div>
                  <dl className="row mb-0" style={{ fontSize: '0.875rem' }}>
                    <dt className="col-sm-5 text-muted">Work Email</dt>
                    <dd className="col-sm-7 text-dark fw-medium">{email}</dd>

                    <dt className="col-sm-5 text-muted">Primary Phone</dt>
                    <dd className="col-sm-7">{employee.phone || 'Not provided'}</dd>

                    <dt className="col-sm-5 text-muted mt-3 border-top pt-2">Emergency Contact</dt>
                    <dd className="col-sm-7 mt-3 border-top pt-2 fw-semibold text-dark">
                      {employee.emergencyContact?.name || 'Not provided'}
                    </dd>

                    <dt className="col-sm-5 text-muted">Relationship</dt>
                    <dd className="col-sm-7">{employee.emergencyContact?.relationship || 'N/A'}</dd>

                    <dt className="col-sm-5 text-muted">Emergency Phone</dt>
                    <dd className="col-sm-7">{employee.emergencyContact?.phone || 'N/A'}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'attendance' ? (
        /* Attendance Tab */
        <div className="ss-card p-0 overflow-hidden shadow-sm">
          <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
            <h3 className="h6 fw-bold mb-0 text-uppercase">Recorded Attendance Logs</h3>
            <span className="badge bg-light text-secondary border font-monospace">
              {attendanceRecords.length} records
            </span>
          </div>
          {attendanceRecords.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <EmptyState
                icon="clock"
                title="No Attendance Trail Found"
                description="No daily punch records have been recorded for this employee yet."
              />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th className="pe-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((r) => (
                    <tr key={r._id || r.id}>
                      <td className="ps-4 fw-semibold text-dark">{formatDate(r.date)}</td>
                      <td>{formatTime(r.checkInTime)}</td>
                      <td>{formatTime(r.checkOutTime)}</td>
                      <td>
                        <span className="badge bg-light text-secondary border font-monospace">
                          {r.totalHours ? `${r.totalHours}h` : 'In Progress'}
                        </span>
                      </td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className="text-muted small pe-4">{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'leaves' ? (
        /* Leaves Tab */
        <div className="ss-card p-0 overflow-hidden shadow-sm">
          <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
            <h3 className="h6 fw-bold mb-0 text-uppercase">Leave Applications</h3>
            <span className="badge bg-light text-secondary border font-monospace">
              {leaveRecords.length} requests
            </span>
          </div>
          {leaveRecords.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <EmptyState
                icon="calendar"
                title="No Leave Requests"
                description="This staff member has not submitted any leave applications."
              />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Leave Type</th>
                    <th>Dates Requested</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRecords.map((lr) => (
                    <tr key={lr._id || lr.id}>
                      <td className="ps-4 fw-semibold">
                        <span className="badge bg-light text-primary border font-monospace">
                          {lr.leaveType}
                        </span>
                      </td>
                      <td>{formatDate(lr.startDate)} → {formatDate(lr.endDate)}</td>
                      <td>
                        <span className="badge bg-light text-secondary border font-monospace">
                          {lr.totalDays} day{lr.totalDays > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="text-truncate small" style={{ maxWidth: '240px' }} title={lr.reason}>
                        {lr.reason}
                      </td>
                      <td className="pe-4"><StatusBadge status={lr.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Emergency Tab */
        <div className="ss-card p-4 shadow-sm">
          <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
            <Icon name="phone" size={18} color="#4F46E5" />
            <h3 className="h6 fw-bold text-uppercase text-dark mb-0">
              Emergency Contact Record
            </h3>
          </div>
          <dl className="row mb-0" style={{ fontSize: '0.875rem' }}>
            <dt className="col-sm-4 text-muted">Emergency Contact Person</dt>
            <dd className="col-sm-8 fw-bold text-dark">{employee.emergencyContact?.name || 'Not on file'}</dd>

            <dt className="col-sm-4 text-muted">Relationship to Employee</dt>
            <dd className="col-sm-8">{employee.emergencyContact?.relationship || 'Not specified'}</dd>

            <dt className="col-sm-4 text-muted">Direct Phone Number</dt>
            <dd className="col-sm-8 font-monospace text-primary">{employee.emergencyContact?.phone || 'Not on file'}</dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
