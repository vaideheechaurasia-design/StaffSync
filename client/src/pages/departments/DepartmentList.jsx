import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const DepartmentList = () => {
  const { role } = useAuth();

  const DEPARTMENTS = [
    { id: 'dept-1', name: 'Engineering', code: 'ENG', manager: 'Marcus Brody', count: 52, description: 'Software engineering, quality assurance, and platform infrastructure.' },
    { id: 'dept-2', name: 'Human Resources', code: 'HR', manager: 'Eleanor Vance', count: 12, description: 'Talent acquisition, employee relations, and compliance.' },
    { id: 'dept-3', name: 'Sales & Marketing', code: 'MKT', manager: 'Sophia Rossi', count: 34, description: 'Enterprise accounts, product marketing, and client growth.' },
    { id: 'dept-4', name: 'Operations', code: 'OPS', manager: 'Nathan Drake', count: 40, description: 'Internal logistics, IT helpdesk, and corporate facilities.' }
  ];

  return (
    <div>
      <PageHeader
        title="Departments & Structure"
        subtitle="Manage organizational departments, assign department head managers, and monitor unit headcounts."
        breadcrumbs={[{ label: 'Departments', path: '/departments' }]}
        actionButton={
          role === 'HR_ADMIN' ? (
            <button
              type="button"
              className="btn btn-accent btn-sm"
              onClick={() => alert('Department creation modal will be functional in Phase 7.')}
            >
              ➕ Create Department
            </button>
          ) : null
        }
      />

      <PlaceholderNotice
        featureName="Department Hierarchy Management"
        targetPhase="Phase 7 (Employee & Department Management)"
        description="Displays the approved organizational department grid. Backend CRUD and deletion prevention for departments with active staff will connect in Phase 7."
      />

      <div className="row g-4">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id} className="col-12 col-md-6 col-xl-3">
            <div className="ss-card ss-card-hover p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-light text-dark border font-monospace">{dept.code}</span>
                  <StatusBadge status="ACTIVE" />
                </div>
                <h2 className="h5 fw-bold mb-1" style={{ color: 'var(--ss-color-primary)' }}>
                  {dept.name}
                </h2>
                <p className="text-muted small mb-3">
                  {dept.description}
                </p>
              </div>

              <div className="pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center small mb-1">
                  <span className="text-muted">Head / Manager:</span>
                  <span className="fw-semibold">{dept.manager}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-muted">Team Members:</span>
                  <span className="badge bg-secondary">{dept.count} members</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentList;

