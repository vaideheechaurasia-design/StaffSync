import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const ManagerDashboard = () => {
  return (
    <div>
      <PageHeader
        title="Manager Supervision Portal"
        subtitle="Department team overview, daily check-in monitoring, and leave request review."
        breadcrumbs={[{ label: 'Manager Dashboard', path: '/dashboard/manager' }]}
        actionButton={
          <Link to="/leaves/approvals" className="btn btn-accent btn-sm">
            📬 Review Pending Leaves (3)
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="Manager Team Analytics"
        targetPhase="Phase 11 (Dashboards, Notifications & Analytics)"
        description="Displays team metrics and approval queues. Multi-tier approval workflows will be wired up in Phase 9."
      />

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <SummaryCard
            label="My Team Members"
            value="14"
            icon="👥"
            changeText="Engineering Department"
          />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard
            label="Team Present Today"
            value="12"
            icon="⏰"
            changeText="1 Late • 1 On Leave"
          />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard
            label="Pending Leave Requests"
            value="3"
            icon="📬"
            changeText="Requires your decision"
          />
        </div>
      </div>

      {/* Team Pending Leave Approvals Table Preview */}
      <div className="ss-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Pending Team Leave Applications
          </h3>
          <Link to="/leaves/approvals" className="small text-decoration-none">
            Go to Full Approval Queue →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th>Applicant</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Jane Doe</strong>
                  <div className="small text-muted">EMP-1003</div>
                </td>
                <td><StatusBadge status="UPCOMING" /> Annual Leave</td>
                <td>Nov 10 – Nov 12, 2026</td>
                <td>3.0 days</td>
                <td><StatusBadge status="PENDING" /></td>
                <td>
                  <Link to="/leaves/approvals" className="btn btn-sm btn-outline-primary py-0">
                    Review
                  </Link>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Robert Smith</strong>
                  <div className="small text-muted">EMP-1008</div>
                </td>
                <td><StatusBadge status="UPCOMING" /> Casual Leave</td>
                <td>Nov 14, 2026</td>
                <td>1.0 day</td>
                <td><StatusBadge status="PENDING" /></td>
                <td>
                  <Link to="/leaves/approvals" className="btn btn-sm btn-outline-primary py-0">
                    Review
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

