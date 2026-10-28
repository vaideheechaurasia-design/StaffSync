import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const LeaveCenter = () => {
  const LEAVE_REQUESTS = [
    { type: 'Annual Leave', dates: 'Nov 10 – Nov 12, 2026', days: '3.0 days', reason: 'Family vacation', status: 'PENDING', reviewer: 'Marcus Brody' },
    { type: 'Sick Leave', dates: 'Oct 14, 2026', days: '1.0 day', reason: 'Flu recovery', status: 'APPROVED', reviewer: 'Marcus Brody' },
    { type: 'Casual Leave', dates: 'Sep 02, 2026', days: '1.0 day', reason: 'Personal appointment', status: 'APPROVED', reviewer: 'Marcus Brody' }
  ];

  return (
    <div>
      <PageHeader
        title="Leave Center & Quotas"
        subtitle="Track your remaining paid time off balances, review active applications, and browse leave history."
        breadcrumbs={[{ label: 'Leaves', path: '/leaves' }]}
        actionButton={
          <Link to="/leaves/apply" className="btn btn-accent btn-sm">
            ➕ Apply for Leave
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="Leave Lifecycle & Approval Engine"
        targetPhase="Phase 9 (Leave Requests & Approval Workflows)"
        description="Displays approved quota balance cards, history tables, and application links. Quota deductions and manager approval workflows will activate in Phase 9."
      />

      {/* Quota Balance Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-primary">
            <span className="small text-muted d-block fw-semibold text-uppercase">Annual Leave</span>
            <span className="fs-3 fw-bold text-primary">11</span>
            <span className="small text-muted d-block">15 total allocated</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-success">
            <span className="small text-muted d-block fw-semibold text-uppercase">Casual Leave</span>
            <span className="fs-3 fw-bold text-success">8</span>
            <span className="small text-muted d-block">10 total allocated</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-warning">
            <span className="small text-muted d-block fw-semibold text-uppercase">Sick Leave</span>
            <span className="fs-3 fw-bold text-warning">9</span>
            <span className="small text-muted d-block">10 total allocated</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-secondary">
            <span className="small text-muted d-block fw-semibold text-uppercase">Unpaid Leave</span>
            <span className="fs-3 fw-bold text-secondary">0</span>
            <span className="small text-muted d-block">Days consumed</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            My Leave Request History
          </h2>
          <span className="text-muted small">Year 2026</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th className="ps-3">Leave Type</th>
                <th>Dates Requested</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Reviewed By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {LEAVE_REQUESTS.map((req, i) => (
                <tr key={i}>
                  <td className="ps-3 fw-semibold">{req.type}</td>
                  <td>{req.dates}</td>
                  <td>{req.days}</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>{req.reason}</td>
                  <td>{req.reviewer}</td>
                  <td><StatusBadge status={req.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveCenter;

