import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const HRDashboard = () => {
  return (
    <div>
      <PageHeader
        title="HR & Administration Dashboard"
        subtitle="Executive workforce overview, daily attendance compliance, and organizational governance."
        breadcrumbs={[{ label: 'HR Dashboard', path: '/dashboard/hr' }]}
        actionButton={
          <Link to="/employees/create" className="btn btn-accent btn-sm">
            ➕ Onboard New Employee
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="HR Analytics & Live Aggregation"
        targetPhase="Phase 11 (Dashboards, Notifications & Analytics)"
        description="This dashboard displays the approved layout, KPI summary cards, and quick actions. Live MongoDB aggregation pipelines will connect in Phase 11."
      />

      {/* KPI Metric Summary Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            label="Total Headcount"
            value="142"
            icon="👥"
            changeText="138 Active • 4 Inactive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            label="Present Today"
            value="126"
            icon="⏰"
            changeText="88.7% Daily Attendance Rate"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            label="On Leave Today"
            value="6"
            icon="✈️"
            changeText="4 Annual • 2 Sick"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            label="Pending Leaves"
            value="9"
            icon="📬"
            changeText="Awaiting manager review"
          />
        </div>
      </div>

      {/* Main Content Grid: Department breakdown & Recent activity */}
      <div className="row g-4">
        {/* Department Overview */}
        <div className="col-lg-7">
          <div className="ss-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Department Distribution
              </h3>
              <Link to="/departments" className="small text-decoration-none">
                Manage Departments →
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Department</th>
                    <th>Code</th>
                    <th>Headcount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Engineering</strong></td>
                    <td><code>ENG</code></td>
                    <td>52 members</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                  <tr>
                    <td><strong>Sales & Marketing</strong></td>
                    <td><code>MKT</code></td>
                    <td>34 members</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                  <tr>
                    <td><strong>Operations</strong></td>
                    <td><code>OPS</code></td>
                    <td>40 members</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                  <tr>
                    <td><strong>Human Resources</strong></td>
                    <td><code>HR</code></td>
                    <td>12 members</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Governance Links */}
        <div className="col-lg-5">
          <div className="ss-card p-4 h-100">
            <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Quick HR Operations
            </h3>
            <div className="d-grid gap-2">
              <Link to="/employees/create" className="btn btn-outline-primary text-start p-2">
                <strong>➕ Onboard Employee</strong>
                <div className="small text-muted">Provision User account & HR profile</div>
              </Link>
              <Link to="/departments" className="btn btn-outline-primary text-start p-2">
                <strong>🏢 Structure Departments</strong>
                <div className="small text-muted">Manage units & assign team leads</div>
              </Link>
              <Link to="/announcements/manage" className="btn btn-outline-primary text-start p-2">
                <strong>📢 Publish Bulletin</strong>
                <div className="small text-muted">Broadcast company-wide news or alerts</div>
              </Link>
              <Link to="/training/manage" className="btn btn-outline-primary text-start p-2">
                <strong>🎓 Schedule Workshop</strong>
                <div className="small text-muted">Create corporate training sessions</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

