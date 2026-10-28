import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import leaveService from '../../api/leaveService.js';

export const ManagerDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);

  useEffect(() => {
    leaveService.getPendingApprovals()
      .then((res) => {
        if (res && res.data) {
          setPendingRequests(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load pending leaves for dashboard:', err);
      })
      .finally(() => {
        setIsLoadingLeaves(false);
      });
  }, []);

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
        title="Manager Supervision Portal"
        subtitle="Department team overview, daily check-in monitoring, and leave request review."
        breadcrumbs={[{ label: 'Manager Dashboard', path: '/dashboard/manager' }]}
        actionButton={
          <Link to="/leaves/approvals" className="btn btn-accent btn-sm">
            📬 Review Pending Leaves ({pendingRequests.length})
          </Link>
        }
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
            value={String(pendingRequests.length)}
            icon="📬"
            changeText={pendingRequests.length > 0 ? "Requires your decision" : "All caught up"}
          />
        </div>
      </div>

      {/* Team Pending Leave Approvals Table */}
      <div className="ss-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Pending Team Leave Applications
          </h3>
          <Link to="/leaves/approvals" className="small text-decoration-none">
            Go to Full Approval Queue →
          </Link>
        </div>

        {isLoadingLeaves ? (
          <div className="p-3 text-center text-muted small">Loading pending requests...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-4 text-center text-muted">
            <div className="fs-3 mb-1">✓</div>
            <p className="mb-0 small">No pending team leave applications awaiting review.</p>
          </div>
        ) : (
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
                {pendingRequests.slice(0, 5).map((req) => {
                  const emp = req.employeeId || {};
                  return (
                    <tr key={req._id}>
                      <td>
                        <strong>{emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</strong>
                        <div className="small text-muted">{emp.employeeCode || '—'}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{req.leaveType}</span></td>
                      <td>{formatDate(req.startDate)} – {formatDate(req.endDate)}</td>
                      <td><span className="font-monospace">{req.totalDays} day{req.totalDays > 1 ? 's' : ''}</span></td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>
                        <Link to="/leaves/approvals" className="btn btn-sm btn-outline-primary py-0">
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
