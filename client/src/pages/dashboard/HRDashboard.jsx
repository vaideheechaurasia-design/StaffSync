import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import leaveService from '../../api/leaveService.js';

export const HRDashboard = () => {
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  useEffect(() => {
    leaveService.getPendingApprovals()
      .then((res) => {
        if (res && res.data) {
          setPendingLeaveCount(res.data.length);
        }
      })
      .catch((err) => {
        console.error('Failed to load pending leaves for HR dashboard:', err);
      });
  }, []);

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
          <Link to="/leaves/approvals" className="text-decoration-none">
            <SummaryCard
              label="Pending Leaves"
              value={String(pendingLeaveCount)}
              icon="📬"
              changeText={pendingLeaveCount > 0 ? "Awaiting administrative review" : "All requests reviewed"}
            />
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Department breakdown & Quick operations */}
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
              <Link to="/leaves/approvals" className="btn btn-outline-primary text-start p-2">
                <strong>📬 Review Leave Requests</strong>
                <div className="small text-muted">Approve or reject pending employee leaves</div>
              </Link>
              <Link to="/attendance/admin" className="btn btn-outline-primary text-start p-2">
                <strong>⏰ Attendance Overview</strong>
                <div className="small text-muted">Company time-tracking & manual punches</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
