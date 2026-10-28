import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const AdminAttendance = () => {
  return (
    <div>
      <PageHeader
        title="Company Attendance Overview"
        subtitle="Organization-wide time-tracking compliance, departmental reports, and attendance exports."
        breadcrumbs={[
          { label: 'Attendance', path: '/attendance' },
          { label: 'Company Overview', path: '/attendance/admin' }
        ]}
      />

      <PlaceholderNotice
        featureName="Company Attendance Aggregation & Reporting"
        targetPhase="Phase 8 (Attendance Management)"
        description="Displays the approved organizational attendance layout and filters. Aggregated stats and export features connect in Phase 8."
      />

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Expected Staff</span>
            <span className="fs-3 fw-bold text-primary">138</span>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Present On Time</span>
            <span className="fs-3 fw-bold text-success">118</span>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Late Arrivals</span>
            <span className="fs-3 fw-bold text-warning">8</span>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Approved Leaves</span>
            <span className="fs-3 fw-bold text-info">6</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;

