import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import leaveService from '../../api/leaveService.js';

export const LeaveApprovals = () => {
  const [pendingList, setPendingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Rejection Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await leaveService.getPendingApprovals();
      if (res && res.data) {
        setPendingList(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch pending leave applications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (req) => {
    const empName = req.employeeId ? `${req.employeeId.firstName} ${req.employeeId.lastName}` : 'the employee';
    if (!window.confirm(`Are you sure you want to approve this ${req.leaveType} request for ${empName}?`)) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await leaveService.review(req._id, {
        status: 'APPROVED',
        reviewComment: 'Approved by authorized manager.'
      });
      setSuccessMsg(`Leave request for ${empName} approved successfully.`);
      await fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Approval action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!rejectionComment || rejectionComment.trim().length < 5) {
      setError('Please provide a rejection comment of at least 5 characters.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const empName = selectedRequest.employeeId
        ? `${selectedRequest.employeeId.firstName} ${selectedRequest.employeeId.lastName}`
        : 'the employee';

      await leaveService.review(selectedRequest._id, {
        status: 'REJECTED',
        reviewComment: rejectionComment.trim()
      });

      setSuccessMsg(`Leave request for ${empName} rejected with recorded feedback.`);
      setSelectedRequest(null);
      setRejectionComment('');
      await fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Rejection action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <PageHeader
        title="Leave Approvals Queue"
        subtitle="Review, approve, or reject pending leave requests submitted by your team members."
        breadcrumbs={[
          { label: 'Leaves', path: '/leaves' },
          { label: 'Approvals Queue', path: '/leaves/approvals' }
        ]}
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Pending Decisions ({pendingList.length})
          </h2>
          <span className="badge bg-warning text-dark">Action Required</span>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Loading pending approvals from MongoDB..." size="md" />
          </div>
        ) : pendingList.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <div className="fs-2 mb-2">🎉</div>
            <p className="mb-0">All caught up! There are no pending leave requests awaiting your decision.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Employee</th>
                  <th>Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th className="text-end pe-3">Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((req) => {
                  const emp = req.employeeId || {};
                  const dept = emp.departmentId || {};
                  return (
                    <tr key={req._id}>
                      <td className="ps-3">
                        <strong>{emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</strong>
                        <div className="small text-muted">
                          {emp.employeeCode || '—'} • {dept.name || 'Department'}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{req.leaveType}</span>
                      </td>
                      <td>
                        {formatDate(req.startDate)} – {formatDate(req.endDate)}
                      </td>
                      <td>
                        <span className="font-monospace">{req.totalDays} day{req.totalDays > 1 ? 's' : ''}</span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '240px' }} title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="text-end pe-3">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => handleApprove(req)}
                            disabled={actionLoading}
                          >
                            ✓ Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => {
                              setSelectedRequest(req);
                              setRejectionComment('');
                            }}
                            disabled={actionLoading}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {selectedRequest && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 32, 39, 0.6)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleRejectConfirm}>
                <div className="modal-header">
                  <h5 className="modal-title h6 fw-bold">Reject Leave Application</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedRequest(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <p className="small text-muted mb-2">
                    Applicant:{' '}
                    <strong>
                      {selectedRequest.employeeId?.firstName} {selectedRequest.employeeId?.lastName}
                    </strong>{' '}
                    ({selectedRequest.leaveType}, {selectedRequest.totalDays} days)
                  </p>
                  <div className="mb-3">
                    <label htmlFor="rejectionReason" className="form-label small fw-semibold">
                      Reason for Rejection <span className="text-danger">* (Mandatory)</span>
                    </label>
                    <textarea
                      id="rejectionReason"
                      className="form-control"
                      rows="3"
                      placeholder="Explain why this request is rejected so the employee is informed..."
                      value={rejectionComment}
                      onChange={(e) => setRejectionComment(e.target.value)}
                      required
                    />
                    <div className="form-text small">Minimum 5 characters required.</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm"
                    disabled={actionLoading || rejectionComment.trim().length < 5}
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Rejection'}
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

export default LeaveApprovals;
