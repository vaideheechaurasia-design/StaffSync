import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';

export const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div>
      <PageHeader
        title="Submit Leave Application"
        subtitle="Apply for time off. Requests are routed to your direct reporting manager for review."
        breadcrumbs={[
          { label: 'Leaves', path: '/leaves' },
          { label: 'Apply for Leave', path: '/leaves/apply' }
        ]}
        actionButton={
          <Link to="/leaves" className="btn btn-outline-secondary btn-sm">
            Cancel
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="Leave Application & Collision Prevention"
        targetPhase="Phase 9 (Leave Requests & Approval Workflows)"
        description="Displays the approved leave request form and live quota widget. Backend date overlap checking and quota validation will connect in Phase 9."
      />

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-8">
          <div className="ss-card p-4">
            <form onSubmit={(e) => { e.preventDefault(); alert('Leave submission will be processed in Phase 9.'); }}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Leave Type <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                >
                  <option value="ANNUAL">Annual Leave (11 days remaining)</option>
                  <option value="CASUAL">Casual Leave (8 days remaining)</option>
                  <option value="SICK">Sick Leave (9 days remaining)</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Start Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">End Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Reason for Absence <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Provide context for your manager (5–500 characters)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minLength={5}
                  maxLength={500}
                  required
                />
                <div className="form-text small">{reason.length} / 500 characters</div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Link to="/leaves" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-accent px-4">
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quota Sidebar */}
        <div className="col-lg-4">
          <div className="ss-card p-4">
            <h2 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Your 2026 Quotas
            </h2>
            <ul className="list-group list-group-flush small mb-3">
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Annual Leave:</span>
                <strong>11 / 15 days</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Casual Leave:</span>
                <strong>8 / 10 days</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Sick Leave:</span>
                <strong>9 / 10 days</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Unpaid Leave:</span>
                <strong>0 days used</strong>
              </li>
            </ul>
            <div className="p-2 bg-light rounded text-muted small">
              ℹ️ Standard working days are counted. Weekends and official company holidays are excluded automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;

