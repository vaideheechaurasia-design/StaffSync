import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import { employeeService } from '../../api/employeeService.js';
import { departmentService } from '../../api/departmentService.js';

export const CreateEmployee = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    // User credentials
    email: '',
    password: 'TempPass123!',
    role: 'EMPLOYEE',
    // Personal details
    firstName: '',
    lastName: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    // Job details
    employeeCode: '',
    departmentId: '',
    designation: '',
    employmentType: 'FULL_TIME',
    dateOfJoining: new Date().toISOString().split('T')[0]
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);

  // Load available departments
  useEffect(() => {
    departmentService.getAll()
      .then((res) => {
        if (res && res.data) {
          setDepartments(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, departmentId: res.data[0]._id || res.data[0].id }));
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load departments:', err.message);
      })
      .finally(() => {
        setIsLoadingDepts(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('Please provide both First Name and Last Name.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Please provide a valid work email address.');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.employeeCode.trim()) {
      setErrorMessage('Please provide a unique Employee Code (e.g. EMP-1002).');
      return;
    }

    if (!formData.designation.trim()) {
      setErrorMessage('Please provide a job title / designation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        employeeCode: formData.employeeCode.trim().toUpperCase(),
        departmentId: formData.departmentId,
        designation: formData.designation.trim(),
        employmentType: formData.employmentType,
        dateOfJoining: formData.dateOfJoining,
        phone: formData.phone.trim(),
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          relationship: formData.emergencyContactRelationship.trim(),
          phone: formData.emergencyContactPhone.trim()
        }
      };

      const response = await employeeService.create(payload);

      if (response && response.success) {
        navigate('/employees', { replace: true });
      } else {
        throw new Error(response?.message || 'Employee creation failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to onboard employee. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Onboard New Employee"
        subtitle="Provision an employee account, assign departmental hierarchy, and initialize personnel profile."
        breadcrumbs={[
          { label: 'Employees', path: '/employees' },
          { label: 'Onboard Employee', path: '/employees/create' }
        ]}
        actionButton={
          <Link to="/employees" className="btn btn-outline-secondary btn-sm">
            Cancel
          </Link>
        }
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="alert alert-danger mb-4 shadow-sm" role="alert">
          <strong>Validation Error:</strong> {errorMessage}
        </div>
      )}

      <div className="ss-card p-4 shadow-sm">
        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: User Account Credentials */}
          <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
            1. User Account Credentials
          </h2>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="field-email" className="form-label small fw-semibold">
                Work Email <span className="text-danger">*</span>
              </label>
              <input
                id="field-email"
                name="email"
                type="email"
                className="form-control"
                placeholder="first.last@staffsync.internal"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="field-password" className="form-label small fw-semibold">
                Temporary Password <span className="text-danger">*</span>
              </label>
              <input
                id="field-password"
                name="password"
                type="text"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="form-text" style={{ fontSize: '0.75rem' }}>Min 8 characters</div>
            </div>
            <div className="col-md-3">
              <label htmlFor="field-role" className="form-label small fw-semibold">
                System Role <span className="text-danger">*</span>
              </label>
              <select
                id="field-role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="EMPLOYEE">Employee (Self-Service)</option>
                <option value="MANAGER">Manager (Team Lead)</option>
                <option value="HR_ADMIN">HR Administrator</option>
              </select>
            </div>
          </div>

          {/* Section 2: Personal & Emergency Details */}
          <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
            2. Personal & Emergency Details
          </h2>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label htmlFor="field-first-name" className="form-label small fw-semibold">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                id="field-first-name"
                name="firstName"
                type="text"
                className="form-control"
                placeholder="e.g. Alex"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="field-last-name" className="form-label small fw-semibold">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                id="field-last-name"
                name="lastName"
                type="text"
                className="form-control"
                placeholder="e.g. Morgan"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="field-phone" className="form-label small fw-semibold">
                Phone Number
              </label>
              <input
                id="field-phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="field-emergency-name" className="form-label small fw-semibold">
                Emergency Contact Name
              </label>
              <input
                id="field-emergency-name"
                name="emergencyContactName"
                type="text"
                className="form-control"
                placeholder="Full name of contact"
                value={formData.emergencyContactName}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="field-emergency-relationship" className="form-label small fw-semibold">
                Relationship
              </label>
              <input
                id="field-emergency-relationship"
                name="emergencyContactRelationship"
                type="text"
                className="form-control"
                placeholder="e.g. Parent, Spouse"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="field-emergency-phone" className="form-label small fw-semibold">
                Emergency Contact Phone
              </label>
              <input
                id="field-emergency-phone"
                name="emergencyContactPhone"
                type="tel"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 3: Department & Job Alignment */}
          <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
            3. Department & Job Alignment
          </h2>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label htmlFor="field-code" className="form-label small fw-semibold">
                Employee Code <span className="text-danger">*</span>
              </label>
              <input
                id="field-code"
                name="employeeCode"
                type="text"
                className="form-control font-monospace"
                placeholder="EMP-1004"
                value={formData.employeeCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="field-dept" className="form-label small fw-semibold">
                Department <span className="text-danger">*</span>
              </label>
              <select
                id="field-dept"
                name="departmentId"
                className="form-select"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={isLoadingDepts}
                required
              >
                {isLoadingDepts ? (
                  <option>Loading departments...</option>
                ) : (
                  departments.map((dept) => (
                    <option key={dept._id || dept.id} value={dept._id || dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="field-designation" className="form-label small fw-semibold">
                Designation / Title <span className="text-danger">*</span>
              </label>
              <input
                id="field-designation"
                name="designation"
                type="text"
                className="form-control"
                placeholder="e.g. Cloud Engineer"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="field-type" className="form-label small fw-semibold">
                Employment Type
              </label>
              <select
                id="field-type"
                name="employmentType"
                className="form-select"
                value={formData.employmentType}
                onChange={handleChange}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <Link to="/employees" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-accent d-flex align-items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Onboarding Staff Member...</span>
                </>
              ) : (
                <span>Save & Onboard Employee</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;
