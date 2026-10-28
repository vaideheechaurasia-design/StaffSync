import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { departmentService } from '../../api/departmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const DepartmentList = () => {
  const { role } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    departmentService.getAll()
      .then((res) => {
        if (res && res.data) {
          setDepartments(res.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load departments.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Departments & Structure"
        subtitle="Manage organizational departments, assign department head managers, and monitor unit headcounts."
        breadcrumbs={[{ label: 'Departments', path: '/departments' }]}
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="ss-card p-5 text-center">
          <LoadingSpinner label="Loading departments from MongoDB..." size="md" />
        </div>
      ) : (
        <div className="row g-4">
          {departments.map((dept) => (
            <div key={dept._id || dept.id} className="col-12 col-md-6 col-xl-3">
              <div className="ss-card ss-card-hover p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-light text-dark border font-monospace">{dept.code}</span>
                    <StatusBadge status={dept.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--ss-color-primary)' }}>
                    {dept.name}
                  </h2>
                  <p className="text-muted small mb-3">
                    {dept.description || 'Organizational business unit.'}
                  </p>
                </div>

                <div className="border-top pt-3 mt-auto">
                  <div className="d-flex justify-content-between text-muted small">
                    <span>Status</span>
                    <span className="fw-semibold text-dark">{dept.isActive ? 'Operational' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
