import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const TeamAttendance = () => {
  const TEAM_RECORDS = [
    { code: 'EMP-1003', name: 'Jane Doe', title: 'Software Engineer', in: '09:12 AM', out: '—', hours: 'In Progress', status: 'PRESENT' },
    { code: 'EMP-1007', name: 'Liam O\'Connor', title: 'QA Engineer', in: '09:44 AM', out: '—', hours: 'In Progress', status: 'LATE' },
    { code: 'EMP-1008', name: 'Robert Smith', title: 'Frontend Developer', in: '08:55 AM', out: '—', hours: 'In Progress', status: 'PRESENT' },
    { code: 'EMP-1011', name: 'Emily Davis', title: 'Backend Developer', in: '—', out: '—', hours: '0.0h', status: 'ON_LEAVE' }
  ];

  return (
    <div>
      <PageHeader
        title="Team Daily Attendance"
        subtitle="Live attendance monitoring and working hour tracking for your department subordinates."
        breadcrumbs={[
          { label: 'Attendance', path: '/attendance' },
          { label: 'Team Attendance', path: '/attendance/team' }
        ]}
      />

      <PlaceholderNotice
        featureName="Team Attendance Roster"
        targetPhase="Phase 8 (Attendance Management)"
        description="Displays the approved manager attendance monitoring table with live status badges. Database filtering scoped by managerId will activate in Phase 8."
      />

      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Today's Subordinate Check-In Status
          </h2>
          <span className="badge bg-light text-dark border">
            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th className="ps-3">Code</th>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TEAM_RECORDS.map((r, i) => (
                <tr key={i}>
                  <td className="ps-3 font-monospace">{r.code}</td>
                  <td>
                    <strong>{r.name}</strong>
                    <div className="small text-muted">{r.title}</div>
                  </td>
                  <td>{r.in}</td>
                  <td>{r.out}</td>
                  <td><span className="font-monospace">{r.hours}</span></td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamAttendance;

