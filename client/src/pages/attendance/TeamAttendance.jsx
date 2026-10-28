import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import attendanceService from '../../api/attendanceService.js';

export const TeamAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [teamRoster, setTeamRoster] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    notPunched: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attendanceService.getTeamAttendance({ date: selectedDate });
      if (res && res.data) {
        setTeamRoster(res.data);
      }
      if (res && res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch team attendance records.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <PageHeader
        title="Team Daily Attendance"
        subtitle="Live attendance monitoring and working hour tracking for your department subordinates."
        breadcrumbs={[
          { label: 'Attendance', path: '/attendance' },
          { label: 'Team Attendance', path: '/attendance/team' }
        ]}
        actionButton={
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="dateFilter" className="small text-muted mb-0">Date:</label>
            <input
              id="dateFilter"
              type="date"
              className="form-control form-control-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto' }}
            />
          </div>
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {/* Team Metric Summary */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Total Subordinates</span>
            <span className="fs-3 fw-bold text-primary">{summary.total}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Present On Time</span>
            <span className="fs-3 fw-bold text-success">{summary.present}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Late Arrivals</span>
            <span className="fs-3 fw-bold text-warning">{summary.late}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Not Punched</span>
            <span className="fs-3 fw-bold text-secondary">{summary.notPunched}</span>
          </div>
        </div>
      </div>

      {/* Team Roster Table */}
      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Subordinate Check-In Roster
          </h2>
          <span className="badge bg-light text-dark border">
            {new Date(selectedDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Loading team roster from MongoDB..." size="md" />
          </div>
        ) : teamRoster.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <div className="fs-2 mb-2">👥</div>
            <p className="mb-0">No subordinate team members found assigned to your department or supervisory chain.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Code</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamRoster.map((entry) => {
                  const emp = entry.employee;
                  const att = entry.attendance;
                  return (
                    <tr key={emp._id}>
                      <td className="ps-3 font-monospace fw-semibold">{emp.employeeCode}</td>
                      <td>
                        <strong>{emp.firstName} {emp.lastName}</strong>
                        <div className="small text-muted">{emp.designation}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{emp.department}</span></td>
                      <td>{formatTime(att?.checkInTime)}</td>
                      <td>{formatTime(att?.checkOutTime)}</td>
                      <td>
                        <span className="font-monospace">
                          {att?.totalHours ? `${att.totalHours}h` : att?.checkInTime ? 'In Progress' : '—'}
                        </span>
                      </td>
                      <td>
                        {entry.status === 'NOT_PUNCHED' ? (
                          <span className="badge bg-secondary">Not Punched</span>
                        ) : (
                          <StatusBadge status={entry.status} />
                        )}
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

export default TeamAttendance;
