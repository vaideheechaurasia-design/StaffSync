import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const LeaveApprovals = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');

  const PENDING_LIST = [
    { id: 'lr-1', name: 'Jane Doe', code: 'EMP-1003', dept: 'Engineering', type: 'Annual Leave', dates: 'Nov 10 – Nov 12, 2026', days: 3.0, reason: 'Family vacation and personal travel.' },
    { id: 'lr-2', name: 'Robert Smith', code: 'EMP-1008', dept: 'Engineering', type: 'Casual Leave', dates: 'Nov 14, 2026', days: 1.0, reason: 'Home maintenance appointment.' },
    { id: 'lr-3', name: 'David Kim', code: 'EMP-1004', dept: 'Sales & Marketing', type: 'Sick Leave', dates: 'Nov 03 – Nov 04, 2026', days: 2.0, reason: 'Medical appointment.' }
  ];

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

      <PlaceholderNotice
        featureName="Manager Approval & Balance Decrement"
        targetPhase="Phase 9 (Leave Requests & Approval Workflows)"
        description="Displays the approved review table and reject modal. Automated balance decrement and notification dispatch will be implemented in Phase 9."
      />

      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Pending Decisions ({PENDING_LIST.length})
          </h2>
          <span className="badge bg-warning text-dark">Action Required</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th className="ps-3">Employee</th>
                <th>Leave Type</th>
                <th>Dates Requested</th>
                <th>Days</th>
                <th>Reason</th>
                <th className="text-end pe-3">Decision</th>
              </tr>
            </thead>
            <tbody>
              {PENDING_LIST.map((req) => (
                <tr key={req.id}>
                  <td className="ps-3">
                    <strong>{req.name}</strong>
                    <div className="small text-muted">{req.code} • {req.dept}</div>
                  </td>
                  <td><strong>{req.type}</strong></td>
                  <td>{req.dates}</td>
                  <td><span className="font-monospace">{req.days} days</span></td>
                  <td className="text-truncate" style={{ maxWidth: '240px' }}>{req.reason}</td>
                  <td className="text-end pe-3">
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => alert(`Leave for ${req.name} approved. (Phase 9 preview)`)}
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setSelectedRequest(req)}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal Preview */}
      {selectedRequest && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 32, 39, 0.6)' }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reject Leave Application</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)} aria-label="Close" />
              </div>
              <div className="modal-body">
                <p className="small text-muted mb-2">
                  Applicant: <strong>{selectedRequest.name}</strong> ({selectedRequest.type}, {selectedRequest.days} days)
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Reason for Rejection <span className="text-danger">* (Mandatory)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Explain why this request is rejected so the employee is informed..."
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    alert('Rejection recorded with comment. (Phase 9 preview)');
                    setSelectedRequest(null);
                  }}
                  disabled={rejectionComment.trim().length < 5}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;

