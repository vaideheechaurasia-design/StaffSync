import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Icon from '../../components/common/Icon.jsx';
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

    // Frontend validation
    if (!formData.email || !formData.email.trim()) {
      setErrorMessage('Work email is mandatory.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setErrorMessage('Temporary password must be at least 8 characters long.');
      return;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('First and last names are mandatory.');
      return;
    }
    if (!formData.employeeCode.trim()) {
      setErrorMessage('Employee code is mandatory (e.g. EMP-1004).');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMessage('Official designation / job title is mandatory.');
      return;
    }
    if (!formData.departmentId) {
      setErrorMessage('Please assign a department.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        employeeCode: formData.employeeCode.trim().toUpperCase(),
        departmentId: formData.departmentId,
        designation: formData.designation.trim(),
        employmentType: formData.employmentType,
        dateOfJoining: formData.dateOfJoining,
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          relationship: formData.emergencyContactRelationship.trim(),
          phone: formData.emergencyContactPhone.trim()
        }
      };

      const res = await employeeService.create(payload);
      if (res && res.data) {
        navigate('/employees', { replace: true });
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
            <Icon name="arrow-left" size={14} />
            <span>Cancel</span>
          </Link>
        }
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="alert alert-danger mb-4 shadow-sm d-flex align-items-center gap-2" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="ss-card p-4 p-md-5 shadow-sm">
        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: User Account Credentials */}
          <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
            <Icon name="shield" size={18} color="#4F46E5" />
            <h2 className="h6 fw-bold mb-0 text-uppercase text-dark">
              1. User Account Credentials
            </h2>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="field-email" className="form-label">
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
              <label htmlFor="field-password" className="form-label">
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
              <label htmlFor="field-role" className="form-label">
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
          <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
            <Icon name="user" size={18} color="#4F46E5" />
            <h2 className="h6 fw-bold mb-0 text-uppercase text-dark">
              2. Personal & Emergency Details
            </h2>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label htmlFor="field-first-name" className="form-label">
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
              <label htmlFor="field-last-name" className="form-label">
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
              <label htmlFor="field-phone" className="form-label">
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
              <label htmlFor="field-emergency-name" className="form-label">
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
              <label htmlFor="field-emergency-relationship" className="form-label">
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
              <label htmlFor="field-emergency-phone" className="form-label">
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
          <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
            <Icon name="building" size={18} color="#4F46E5" />
            <h2 className="h6 fw-bold mb-0 text-uppercase text-dark">
              3. Department & Job Alignment
            </h2>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label htmlFor="field-code" className="form-label">
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
              <label htmlFor="field-dept" className="form-label">
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
              <label htmlFor="field-designation" className="form-label">
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
              <label htmlFor="field-type" className="form-label">
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
              className="btn btn-accent px-4 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Onboarding Staff Member...</span>
                </>
              ) : (
                <>
                  <Icon name="user-plus" size={16} />
                  <span>Save & Onboard Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;
