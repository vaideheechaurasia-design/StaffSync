import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import Icon from '../../components/common/Icon.jsx';
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

  // Auto-Refresh & Live Polling
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFetchingRef = useRef(false);

  const fetchTeamData = useCallback(async (isSilent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const res = await attendanceService.getTeamAttendance({ date: selectedDate });
      if (res && res.data) {
        setTeamRoster(res.data);
      }
      if (res && res.summary) {
        setSummary(res.summary);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      if (!isSilent) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch team attendance records.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTeamData(false);
  }, [fetchTeamData]);

  // Live Auto-Refresh Polling Timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchTeamData(true);
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, fetchTeamData]);

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
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Auto-Refresh Frequency Control */}
            <div className="d-flex align-items-center gap-1.5 bg-light p-1 rounded-3 border">
              <span className="small text-muted px-1.5 fw-semibold" style={{ fontSize: '0.75rem' }}>Auto-Sync:</span>
              <select
                className="form-select form-select-sm border-0 py-0.5 bg-transparent"
                style={{ fontSize: '0.75rem', width: 'auto' }}
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              >
                <option value={0}>Off</option>
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>

            {/* Manual Sync Button */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm shadow-xs d-flex align-items-center gap-1.5"
              onClick={() => fetchTeamData(false)}
              disabled={isRefreshing}
              title="Poll latest team records from Atlas"
            >
              <Icon name="refresh" size={14} className={isRefreshing ? 'rotate-animation' : ''} />
              <span>Sync</span>
            </button>

            {/* Date Filter */}
            <div className="d-flex align-items-center gap-1.5">
              <input
                id="teamDateFilter"
                type="date"
                className="form-control form-control-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: 'auto' }}
                aria-label="Filter attendance by date"
              />
            </div>
          </div>
        }
      />

      {/* Sync Status Banner */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-1 text-muted small">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: autoRefreshInterval > 0 ? '#10B981' : '#64748B',
              boxShadow: autoRefreshInterval > 0 ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
            }}
          />
          <span className="fw-medium">
            {autoRefreshInterval > 0
              ? `Live Team Monitoring active (every ${autoRefreshInterval}s)`
              : 'Auto-sync paused (manual sync only)'}
          </span>
        </div>
        <div>
          Last updated: <strong>{lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{error}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {/* Team Metric Summary */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Total Subordinates"
            value={String(summary.total)}
            icon="users"
            variant="indigo"
          />
        </div>
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Present On Time"
            value={String(summary.present)}
            icon="check-circle"
            variant="emerald"
          />
        </div>
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Late Arrivals"
            value={String(summary.late)}
            icon="clock"
            variant="amber"
          />
        </div>
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Not Punched"
            value={String(summary.notPunched)}
            icon="alert-circle"
            variant="rose"
          />
        </div>
      </div>

      {/* Team Attendance Roster Table */}
      <div className="ss-card p-0 overflow-hidden shadow-sm">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <div className="d-flex align-items-center gap-2">
            <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Subordinate Shift Roster
            </h2>
            <span className="badge bg-light text-secondary border font-monospace">
              {teamRoster.length} Members
            </span>
          </div>
          <span className="small text-muted">
            Date: <strong>{selectedDate}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Fetching live team punch logs from Atlas..." size="md" />
          </div>
        ) : teamRoster.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <EmptyState
              icon="users"
              title="No Team Records Found"
              description="Zero subordinate records found for the selected department and date."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Employee</th>
                  <th>Designation</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours Logged</th>
                  <th className="text-end pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {teamRoster.map((item) => {
                  const emp = item.employee || {};
                  const record = item.record;
                  const fullName = emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Staff Member';
                  const initials = emp.firstName ? `${emp.firstName[0]}${emp.lastName?.[0] || ''}` : 'U';

                  return (
                    <tr key={emp._id || emp.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: '34px', height: '34px', backgroundColor: '#1E293B', fontSize: '0.75rem' }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{fullName}</div>
                            <div className="text-muted small">
                              {emp.employeeCode || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border font-monospace">
                          {emp.designation || 'Staff'}
                        </span>
                      </td>
                      <td>
                        {record?.checkInTime ? (
                          <span className="fw-medium text-dark">{formatTime(record.checkInTime)}</span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {record?.checkOutTime ? (
                          <span className="fw-medium text-dark">{formatTime(record.checkOutTime)}</span>
                        ) : record?.checkInTime ? (
                          <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                            On Floor
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {record?.totalHours ? (
                          <span className="badge bg-light text-primary border font-monospace">
                            {record.totalHours} hrs
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <StatusBadge status={record ? record.status : 'ABSENT'} />
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
