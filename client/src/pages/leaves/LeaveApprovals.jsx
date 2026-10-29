import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import leaveService from '../../api/leaveService.js';
import { exportToCSV } from '../../utils/csvExport.js';

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
    if (!selectedRequest || !rejectionComment.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await leaveService.review(selectedRequest._id, {
        status: 'REJECTED',
        reviewComment: rejectionComment.trim()
      });
      setSuccessMsg(`Leave application has been rejected.`);
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

  const handleExportCSV = () => {
    const columns = [
      { key: 'employeeId.employeeCode', label: 'Employee Code' },
      { key: 'employeeId.firstName', label: 'First Name' },
      { key: 'employeeId.lastName', label: 'Last Name' },
      { key: 'employeeId.departmentId.name', label: 'Department' },
      { key: 'leaveType', label: 'Leave Type' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'totalDays', label: 'Days' },
      { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Status' }
    ];
    exportToCSV(`staffsync-pending-leaves-${new Date().toISOString().split('T')[0]}.csv`, pendingList, columns);
  };

  return (
    <div>
      <PageHeader
        title="Leave Request Approvals"
        subtitle="Review, authorize, or reject submitted employee time-off applications."
        breadcrumbs={[
          { label: 'Leaves', path: '/leaves' },
          { label: 'Approvals', path: '/leaves/approvals' }
        ]}
        badge={pendingList.length > 0 ? `${pendingList.length} Action Required` : 'Queue Empty'}
        actionButton={
          pendingList.length > 0 ? (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
              onClick={handleExportCSV}
              title="Export pending applications to CSV"
            >
              <Icon name="download" size={14} />
              <span>Export CSV</span>
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

      <div className="ss-card p-0 overflow-hidden shadow-sm">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <div className="d-flex align-items-center gap-2">
            <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Pending Decision Queue
            </h2>
            <span className="badge bg-warning text-dark border font-monospace">
              {pendingList.length} Pending
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Querying pending leave applications from Atlas..." size="md" />
          </div>
        ) : pendingList.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <EmptyState
              icon="check-circle"
              title="All Caught Up!"
              description="There are currently zero pending employee leave applications awaiting your review."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Employee</th>
                  <th>Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th className="text-end pe-4">Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((req) => {
                  const emp = req.employeeId || {};
                  const dept = emp.departmentId || {};
                  const fullName = emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Staff Member';
                  const initials = emp.firstName ? `${emp.firstName[0]}${emp.lastName?.[0] || ''}` : 'U';

                  return (
                    <tr key={req._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: '34px', height: '34px', backgroundColor: '#1E293B', fontSize: '0.75rem' }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{fullName}</div>
                            <div className="text-muted small">
                              {emp.employeeCode || '—'} • {dept.name || 'Staff'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace">
                          {req.leaveType}
                        </span>
                      </td>
                      <td className="fw-medium text-dark">
                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border font-monospace">
                          {req.totalDays} day{req.totalDays > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="text-truncate small" style={{ maxWidth: '240px' }} title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-1.5">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2.5"
                            onClick={() => handleApprove(req)}
                            disabled={actionLoading}
                          >
                            <Icon name="check" size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-2.5"
                            onClick={() => {
                              setSelectedRequest(req);
                              setRejectionComment('');
                            }}
                            disabled={actionLoading}
                          >
                            <Icon name="x" size={14} />
                            <span>Reject</span>
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
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-xl" style={{ borderRadius: '16px' }}>
              <form onSubmit={handleRejectConfirm}>
                <div className="modal-header border-bottom py-3 px-4">
                  <h5 className="modal-title h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    <Icon name="x" size={18} color="#DC2626" />
                    <span>Reject Leave Application</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedRequest(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="p-3 rounded-3 bg-light border mb-3 small">
                    <span className="text-muted">Applicant: </span>
                    <strong className="text-dark">
                      {selectedRequest.employeeId?.firstName} {selectedRequest.employeeId?.lastName}
                    </strong>
                    <div className="text-muted mt-1">
                      Type: <strong>{selectedRequest.leaveType}</strong> • Duration: <strong>{selectedRequest.totalDays} days</strong>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label htmlFor="rejectionReason" className="form-label">
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
                <div className="modal-footer border-top py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
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
