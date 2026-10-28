import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';

export const CreateEmployee = () => {
  return (
    <div>
      <PageHeader
        title="Onboard New Employee"
        subtitle="Provision an employee account, assign departmental hierarchy, and initialize annual leave quotas."
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

      <PlaceholderNotice
        featureName="Employee Onboarding Pipeline"
        targetPhase="Phase 7 (Employee Management)"
        description="This form outlines the approved field definitions, emergency contact inputs, and validation structure. Server persistence connects in Phase 7."
      />

      <div className="ss-card p-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
            1. User Account Credentials
          </h2>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Work Email <span className="text-danger">*</span></label>
              <input type="email" className="form-control" placeholder="first.last@staffsync.internal" required />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Temporary Password <span className="text-danger">*</span></label>
              <input type="password" className="form-control" defaultValue="TempPass123!" required />
              <div className="form-text" style={{ fontSize: '0.75rem' }}>Min 8 characters (Approved policy)</div>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">System Role <span className="text-danger">*</span></label>
              <select className="form-select" defaultValue="EMPLOYEE">
                <option value="EMPLOYEE">Employee (Self-Service)</option>
                <option value="MANAGER">Manager (Team Lead)</option>
                <option value="HR_ADMIN">HR / Administrator</option>
              </select>
            </div>
          </div>

          <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
            2. Personal & Emergency Details
          </h2>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">First Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" placeholder="e.g. Alex" required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Last Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" placeholder="e.g. Morgan" required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Primary Emergency Contact Name</label>
              <input type="text" className="form-control" placeholder="Full name of contact" />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Relationship</label>
              <input type="text" className="form-control" placeholder="e.g. Parent, Spouse" />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Emergency Contact Phone</label>
              <input type="tel" className="form-control" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
            3. Department & Job Alignment
          </h2>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Employee Code <span className="text-danger">*</span></label>
              <input type="text" className="form-control font-monospace" placeholder="EMP-1004" required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Department <span className="text-danger">*</span></label>
              <select className="form-select" required>
                <option value="">Select department...</option>
                <option value="eng">Engineering</option>
                <option value="mkt">Sales & Marketing</option>
                <option value="hr">Human Resources</option>
                <option value="ops">Operations</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Designation / Title <span className="text-danger">*</span></label>
              <input type="text" className="form-control" placeholder="e.g. Cloud Engineer" required />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <Link to="/employees" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-accent" onClick={() => alert('Onboarding submission will be processed in Phase 7.')}>
              Save & Onboard Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;

