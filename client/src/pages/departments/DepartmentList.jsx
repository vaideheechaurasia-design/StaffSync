import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import { departmentService } from '../../api/departmentService.js';
import employeeService from '../../api/employeeService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const DepartmentList = () => {
  const { role } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Create Department Modal
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentService.getAll(),
        employeeService.getAll().catch(() => ({ data: [] }))
      ]);

      if (deptRes && deptRes.data) {
        setDepartments(deptRes.data);
      }
      if (empRes && empRes.data) {
        setEmployees(empRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load organizational departments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Please provide department name and code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await departmentService.create({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim()
      });
      setSuccessMsg(`Department "${formData.name.trim()}" created successfully in MongoDB Atlas.`);
      setShowModal(false);
      setFormData({ name: '', code: '', description: '' });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute headcount per department from actual employee records
  const totalEmployees = employees.length;
  const filteredDepartments = departments.filter((dept) => {
    const term = searchTerm.toLowerCase();
    return (
      (dept.name && dept.name.toLowerCase().includes(term)) ||
      (dept.code && dept.code.toLowerCase().includes(term)) ||
      (dept.description && dept.description.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <PageHeader
        title="Departments & Organization"
        subtitle="Manage business units, assign department leadership, and monitor team structures."
        breadcrumbs={[{ label: 'Departments', path: '/departments' }]}
        badge={`${departments.length} Units`}
        actionButton={
          role === 'HR_ADMIN' ? (
            <button
              type="button"
              className="btn btn-accent btn-sm d-flex align-items-center gap-1.5 shadow-sm"
              onClick={() => {
                setShowModal(true);
                setError(null);
              }}
            >
              <Icon name="plus" size={15} />
              <span>Add Department</span>
            </button>
          ) : null
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{error}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check-circle" size={18} />
          <div>{successMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Search and Summary Bar */}
      <div className="ss-card p-3 mb-4 shadow-sm bg-light border">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '400px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0">
                <Icon name="search" size={15} color="#64748B" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by department name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="small text-muted font-monospace">
            Total Organization Workforce: <strong>{totalEmployees}</strong> members
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="ss-card p-5 text-center my-4">
          <LoadingSpinner label="Fetching organizational units from Atlas..." size="md" />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="ss-card p-5 my-4">
          <EmptyState
            icon="building"
            title={searchTerm ? 'No Matching Departments' : 'No Departments Configured'}
            description={
              searchTerm
                ? `No departments matched your query "${searchTerm}".`
                : 'No organizational units have been registered in the database yet.'
            }
          />
        </div>
      ) : (
        <div className="row g-4">
          {filteredDepartments.map((dept) => {
            const deptId = String(dept._id || dept.id || '');
            const deptEmployees = employees.filter((emp) => {
              const eDeptId = String(emp.departmentId?._id || emp.departmentId?.id || emp.departmentId || '');
              return eDeptId === deptId;
            });
            const headcount = deptEmployees.length;
            const activeHeadcount = deptEmployees.filter((emp) => emp.status === 'ACTIVE').length;

            const capacityPercent = totalEmployees > 0 ? Math.round((headcount / totalEmployees) * 100) : 0;

            return (
              <div key={deptId} className="col-12 col-md-6 col-xl-3">
                <div className="ss-card ss-card-hover p-4 h-100 d-flex flex-column justify-content-between position-relative shadow-sm">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                        style={{
                          width: '42px',
                          height: '42px',
                          backgroundColor: '#EEF2FF',
                          color: '#4F46E5',
                          border: '1px solid #E0E7FF'
                        }}
                      >
                        <Icon name="building" size={22} color="#4F46E5" />
                      </div>
                      <StatusBadge status={dept.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </div>

                    <div className="mb-2">
                      <span className="badge bg-light text-secondary border font-monospace small mb-1">
                        {dept.code}
                      </span>
                      <h2 className="h5 fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.01em' }}>
                        {dept.name}
                      </h2>
                    </div>

                    <p className="text-muted small mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {dept.description || 'Core organizational business unit.'}
                    </p>
                  </div>

                  <div className="border-top pt-3 mt-auto">
                    {/* Headcount Metrics */}
                    <div className="d-flex justify-content-between align-items-center mb-1.5 small">
                      <span className="text-muted">Allocated Staff</span>
                      <div>
                        <strong className="text-dark font-monospace">
                          {headcount} {headcount === 1 ? 'member' : 'members'}
                        </strong>
                        {headcount > 0 && headcount !== activeHeadcount && (
                          <span className="text-muted ms-1 small">({activeHeadcount} active)</span>
                        )}
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="progress mb-2" style={{ height: '6px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${capacityPercent}%`, backgroundColor: '#4F46E5' }}
                        aria-valuenow={capacityPercent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        title={`${capacityPercent}% of total workforce`}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                      <span>Workforce Share</span>
                      <span className="font-monospace text-primary fw-semibold">{capacityPercent}%</span>
                    </div>

                    <div className="mt-3 pt-2 border-top">
                      <Link
                        to={`/employees?dept=${deptId}`}
                        className="small fw-semibold text-decoration-none d-flex align-items-center justify-content-between"
                      >
                        <span>View Staff Members</span>
                        <Icon name="arrow-right" size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Department Modal (HR_ADMIN only) */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl" style={{ borderRadius: '16px' }}>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-header border-bottom py-3 px-4">
                  <h3 className="modal-title h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    <Icon name="building" size={18} color="#4F46E5" />
                    <span>Create Organizational Department</span>
                  </h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Department Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Legal & Compliance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Department Code <span className="text-danger">* (Max 10 chars, uppercase)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="e.g. LGL"
                      maxLength={10}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Operational mission and responsibilities of this unit..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-accent btn-sm px-4 shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
