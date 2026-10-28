import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const AttendanceLog = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const ATTENDANCE_HISTORY = [
    { date: 'Oct 27, 2026', in: '09:05 AM', out: '05:32 PM', hours: '8.45h', status: 'PRESENT' },
    { date: 'Oct 26, 2026', in: '09:42 AM', out: '06:15 PM', hours: '8.55h', status: 'LATE' },
    { date: 'Oct 24, 2026', in: '09:10 AM', out: '01:15 PM', hours: '4.08h', status: 'HALF_DAY' },
    { date: 'Oct 23, 2026', in: '09:02 AM', out: '05:15 PM', hours: '8.22h', status: 'PRESENT' },
    { date: 'Oct 22, 2026', in: '08:58 AM', out: '05:08 PM', hours: '8.17h', status: 'PRESENT' }
  ];

  return (
    <div>
      <PageHeader
        title="Personal Attendance Log"
        subtitle="Daily clock-in/out console, working hour calculations, and monthly punch history."
        breadcrumbs={[{ label: 'Attendance', path: '/attendance' }]}
        actionButton={
          <button
            type="button"
            className={`btn btn-sm ${isCheckedIn ? 'btn-outline-danger' : 'btn-accent'}`}
            onClick={() => setIsCheckedIn(!isCheckedIn)}
          >
            {isCheckedIn ? 'Clock Out' : '⏰ Clock In'}
          </button>
        }
      />

      <PlaceholderNotice
        featureName="Attendance Engine & Double-Punch Protection"
        targetPhase="Phase 8 (Attendance Management)"
        description="Daily punch operations below preview the interactive states. Compound unique index enforcement and working duration arithmetic will connect in Phase 8."
      />

      {/* Monthly Summary Bar */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Days Present</span>
            <span className="fs-4 fw-bold text-success">18</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Late Arrivals</span>
            <span className="fs-4 fw-bold text-warning">2</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Half Days</span>
            <span className="fs-4 fw-bold text-info">1</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Avg Working Hours</span>
            <span className="fs-4 fw-bold text-primary">8.3h</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            October 2026 Attendance Records
          </h2>
          <span className="text-muted small">Target Shift: 8.0h / day</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th className="ps-3">Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE_HISTORY.map((row, idx) => (
                <tr key={idx}>
                  <td className="ps-3 fw-semibold">{row.date}</td>
                  <td>{row.in}</td>
                  <td>{row.out}</td>
                  <td><span className="font-monospace">{row.hours}</span></td>
                  <td><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLog;

