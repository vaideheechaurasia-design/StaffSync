import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const EmployeeDashboard = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  const handleToggleCheckIn = () => {
    if (!hasCheckedIn) {
      setHasCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setHasCheckedIn(false);
      setCheckInTime(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Employee Self-Service Dashboard"
        subtitle="Record daily attendance, inspect your remaining leave quotas, and browse company news."
        breadcrumbs={[{ label: 'Employee Dashboard', path: '/dashboard/employee' }]}
        actionButton={
          <Link to="/leaves/apply" className="btn btn-accent btn-sm">
            ➕ Apply for Leave
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="Attendance Engine & Quotas"
        targetPhase="Phase 8 (Attendance) & Phase 9 (Leaves)"
        description="The live check-in widget below previews the UI state transitions. Backend persistence and hour calculation connect in Phase 8."
      />

      {/* Top Row: Daily Punch Widget & Leave Quotas */}
      <div className="row g-4 mb-4">
        {/* Interactive Punch Clock Widget */}
        <div className="col-lg-5">
          <div className="ss-card p-4 h-100 text-center d-flex flex-column justify-content-between">
            <div>
              <span className="text-muted text-uppercase fw-semibold small" style={{ letterSpacing: '0.04em' }}>
                Today's Work Shift
              </span>
              <h2 className="h4 fw-bold mt-2 mb-1" style={{ color: 'var(--ss-color-primary)' }}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="my-3">
                <StatusBadge status={hasCheckedIn ? 'PRESENT' : 'INACTIVE'} />
              </div>
              <p className="small text-muted mb-4">
                {hasCheckedIn ? `Clocked In at ${checkInTime} • Shift active` : 'You have not checked in for today yet.'}
              </p>
            </div>

            <div>
              <button
                type="button"
                className={`btn btn-lg w-100 py-3 fw-bold ${hasCheckedIn ? 'btn-outline-danger' : 'btn-accent'}`}
                onClick={handleToggleCheckIn}
              >
                {hasCheckedIn ? 'Clock Out (End Shift)' : '⏰ Clock In Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Leave Quota Balances Summary */}
        <div className="col-lg-7">
          <div className="ss-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                2026 Leave Balances
              </h3>
              <Link to="/leaves" className="small text-decoration-none">
                View Full Leave History →
              </Link>
            </div>

            <div className="row g-3">
              <div className="col-6 col-sm-3">
                <div className="p-3 bg-light rounded text-center border">
                  <div className="small text-muted mb-1">Annual</div>
                  <div className="fs-4 fw-bold text-primary">11</div>
                  <div className="small text-muted">/ 15 days</div>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="p-3 bg-light rounded text-center border">
                  <div className="small text-muted mb-1">Casual</div>
                  <div className="fs-4 fw-bold text-success">8</div>
                  <div className="small text-muted">/ 10 days</div>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="p-3 bg-light rounded text-center border">
                  <div className="small text-muted mb-1">Sick</div>
                  <div className="fs-4 fw-bold text-warning">9</div>
                  <div className="small text-muted">/ 10 days</div>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="p-3 bg-light rounded text-center border">
                  <div className="small text-muted mb-1">Unpaid</div>
                  <div className="fs-4 fw-bold text-secondary">0</div>
                  <div className="small text-muted">days used</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
              <span className="small text-muted">Need time off? Submit before planning your travel.</span>
              <Link to="/leaves/apply" className="btn btn-sm btn-primary">
                Apply for Leave
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Feed Preview */}
      <div className="ss-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Latest Company Announcements
          </h3>
          <Link to="/announcements" className="small text-decoration-none">
            View All Bulletins →
          </Link>
        </div>

        <div className="list-group list-group-flush">
          <div className="list-group-item px-0 py-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h4 className="h6 mb-0 fw-bold">Annual Company Retreat 2026</h4>
              <span className="badge bg-danger">URGENT</span>
            </div>
            <p className="text-muted small mb-1">
              We are excited to announce our annual company retreat scheduled for next month. Please review travel requirements and RSVP.
            </p>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Posted by HR Operations • 2 days ago</span>
          </div>

          <div className="list-group-item px-0 py-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h4 className="h6 mb-0 fw-bold">New Health & Wellness Benefit Enrollment</h4>
              <span className="badge bg-primary">POLICY</span>
            </div>
            <p className="text-muted small mb-1">
              Open enrollment for optional health benefits is now open for all full-time employees through the end of the quarter.
            </p>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Posted by People Ops • 5 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

