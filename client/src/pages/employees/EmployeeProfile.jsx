import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { employeeService } from '../../api/employeeService.js';
import { departmentService } from '../../api/departmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const EmployeeProfile = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
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
      } else {
        throw new Error('Employee record not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve employee profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

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

      const response = await employeeService.update(employee._id || employee.id, payload);

      if (response && response.success) {
        setEmployee(response.data);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
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
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error || 'Employee record could not be found.'}
        </div>
        <Link to="/employees" className="btn btn-outline-secondary">
          ← Back to Employee Directory
        </Link>
      </div>
    );
  }

  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName;
  const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase() || 'EMP';
  const email = employee.userId?.email || 'N/A';
  const departmentName = employee.departmentId?.name || 'Unassigned';
  const departmentCode = employee.departmentId?.code || 'N/A';
  const hireDate = employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A';

  return (
    <div>
      <PageHeader
        title="Employee Profile Details"
        subtitle="Individual personnel record, emergency contacts, and organizational parameters."
        breadcrumbs={[
          { label: 'Employees', path: '/employees' },
          { label: fullName, path: `/employees/${id}` }
        ]}
        actionButton={
          <div className="d-flex gap-2">
            <Link to="/employees" className="btn btn-outline-secondary btn-sm">
              ← Back to Directory
            </Link>
            {role === 'HR_ADMIN' && !isEditing && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        }
      />

      {saveSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          ✅ Employee profile successfully updated in MongoDB.
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="ss-card p-4 mb-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3"
            style={{ width: '72px', height: '72px', backgroundColor: 'var(--ss-color-primary)' }}
          >
            {initials}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h1 className="h4 mb-0 fw-bold" style={{ color: 'var(--ss-color-primary)' }}>
                {fullName}
              </h1>
              <span className="badge bg-light text-dark border font-monospace">{employee.employeeCode}</span>
              <StatusBadge status={employee.status} />
              <span className="badge bg-secondary">{employee.employmentType || 'FULL_TIME'}</span>
            </div>
            <p className="text-muted mb-0">
              {employee.designation} • {departmentName} ({departmentCode}) • Work Email: <strong>{email}</strong>
            </p>
          </div>
          {role === 'HR_ADMIN' && employee.status === 'ACTIVE' && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm align-self-start align-self-md-center"
              onClick={handleDeactivate}
            >
              Deactivate Employee
            </button>
          )}
        </div>
      </div>

      {/* Edit Mode vs View Mode */}
      {isEditing ? (
        <div className="ss-card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
            <h2 className="h5 fw-bold mb-0">Edit Employee Details</h2>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel Edit
            </button>
          </div>

          <form onSubmit={handleSaveUpdate}>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">First Name</label>
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
                <label className="form-label small fw-semibold">Last Name</label>
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
                <label className="form-label small fw-semibold">Designation / Title</label>
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
                <label className="form-label small fw-semibold">Department</label>
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
                <label className="form-label small fw-semibold">Employment Status</label>
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

              <div className="col-md-4">
                <label className="form-label small fw-semibold">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Employment Type</label>
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
                <h3 className="h6 fw-bold text-uppercase text-muted border-bottom pb-1">Emergency Contact</h3>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Contact Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  className="form-control"
                  value={editFormData.emergencyName}
                  onChange={handleEditChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Relationship</label>
                <input
                  type="text"
                  name="emergencyRelationship"
                  className="form-control"
                  value={editFormData.emergencyRelationship}
                  onChange={handleEditChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Contact Phone</label>
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
                className="btn btn-accent d-flex align-items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>💾 Save Profile Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Mode */
        <div className="row g-4">
          {/* Column 1: Personnel & Job Information */}
          <div className="col-12 col-lg-6">
            <div className="ss-card p-4 h-100 shadow-sm">
              <h2 className="h6 fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                🏢 Job & Organizational Parameters
              </h2>
              <dl className="row mb-0" style={{ fontSize: '0.9rem' }}>
                <dt className="col-sm-5 text-muted">Employee Code</dt>
                <dd className="col-sm-7 font-monospace fw-semibold">{employee.employeeCode}</dd>

                <dt className="col-sm-5 text-muted">Official Designation</dt>
                <dd className="col-sm-7 fw-semibold">{employee.designation}</dd>

                <dt className="col-sm-5 text-muted">Department</dt>
                <dd className="col-sm-7">{departmentName} ({departmentCode})</dd>

                <dt className="col-sm-5 text-muted">Date of Joining</dt>
                <dd className="col-sm-7">{hireDate}</dd>

                <dt className="col-sm-5 text-muted">Employment Type</dt>
                <dd className="col-sm-7">{employee.employmentType || 'FULL_TIME'}</dd>

                <dt className="col-sm-5 text-muted">Account Status</dt>
                <dd className="col-sm-7">
                  <StatusBadge status={employee.status} />
                </dd>
              </dl>
            </div>
          </div>

          {/* Column 2: Contact & Emergency Information */}
          <div className="col-12 col-lg-6">
            <div className="ss-card p-4 h-100 shadow-sm">
              <h2 className="h6 fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                📞 Contact & Emergency Details
              </h2>
              <dl className="row mb-0" style={{ fontSize: '0.9rem' }}>
                <dt className="col-sm-5 text-muted">Work Email</dt>
                <dd className="col-sm-7">{email}</dd>

                <dt className="col-sm-5 text-muted">Primary Phone</dt>
                <dd className="col-sm-7">{employee.phone || 'Not provided'}</dd>

                <dt className="col-sm-5 text-muted mt-3 border-top pt-2">Emergency Contact</dt>
                <dd className="col-sm-7 mt-3 border-top pt-2 fw-semibold">
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
      )}
    </div>
  );
};

export default EmployeeProfile;
