import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import attendanceService from '../../api/attendanceService.js';

export const AttendanceLog = () => {
  const [todayStatus, setTodayStatus] = useState({ isCheckedIn: false, isCheckedOut: false, record: null });
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    absentCount: 0,
    totalWorkingHours: 0,
    avgWorkingHours: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isFetchingRef = useRef(false);

  const fetchAttendanceData = useCallback(async (isSilent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const [todayRes, historyRes] = await Promise.all([
        attendanceService.getTodayStatus(),
        attendanceService.getMyHistory()
      ]);

      if (todayRes && todayRes.data) {
        setTodayStatus(todayRes.data);
      }
      if (historyRes && historyRes.data) {
        setHistory(historyRes.data);
      }
      if (historyRes && historyRes.summary) {
        setSummary(historyRes.summary);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      if (!isSilent) {
        setError(err.response?.data?.message || err.message || 'Failed to load attendance logs.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAttendanceData(false);
  }, [fetchAttendanceData]);

  // Automatic Live Attendance Monitoring: 30s background sync
  useEffect(() => {
    const timerId = setInterval(() => {
      fetchAttendanceData(true);
    }, 30000);

    return () => clearInterval(timerId);
  }, [fetchAttendanceData]);

  const handlePunchAction = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!todayStatus.isCheckedIn) {
        // Clock In
        const res = await attendanceService.checkIn('Office Console Check-In');
        setSuccessMsg(res.message || 'Clocked in successfully! Today shift started.');
      } else if (!todayStatus.isCheckedOut) {
        // Clock Out
        const res = await attendanceService.checkOut('Office Console Check-Out');
        setSuccessMsg(res.message || 'Clocked out successfully! Shift recorded.');
      }
      await fetchAttendanceData(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Punch operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return isNaN(d.getTime())
      ? timeStr
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <PageHeader
        title="Personal Attendance Log"
        subtitle="Record daily shift check-ins, view total working hours, and review your historical punch trail."
        breadcrumbs={[{ label: 'Attendance', path: '/attendance' }]}
        actionButton={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
              onClick={() => fetchAttendanceData(false)}
              disabled={isRefreshing}
              title="Poll latest punch status from Atlas"
            >
              <Icon name="refresh" size={14} className={isRefreshing ? 'rotate-animation' : ''} />
              <span className="d-none d-sm-inline">Sync</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                todayStatus.isCheckedOut
                  ? 'btn-outline-secondary'
                  : todayStatus.isCheckedIn
                  ? 'btn-outline-danger'
                  : 'btn-accent shadow-sm'
              }`}
              onClick={handlePunchAction}
              disabled={actionLoading || todayStatus.isCheckedOut}
            >
              {actionLoading ? (
                <span>Processing...</span>
              ) : todayStatus.isCheckedOut ? (
                <>
                  <Icon name="check" size={15} />
                  <span>Shift Complete</span>
                </>
              ) : todayStatus.isCheckedIn ? (
                <>
                  <Icon name="clock" size={16} />
                  <span>Clock Out (End Shift)</span>
                </>
              ) : (
                <>
                  <Icon name="clock" size={16} />
                  <span>Clock In Now</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Live Polling & Sync Status Banner */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-1 text-muted small">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
            }}
          />
          <span className="fw-medium">
            Live Attendance Sync Active (every 30s)
          </span>
        </div>
        <div>
          Last verified: <strong>{lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{error}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check-circle" size={18} />
          <div>{successMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Today Punch Status Banner */}
      <div
        className="ss-card p-4 mb-4 border-start border-4 shadow-sm"
        style={{
          borderLeftColor: todayStatus.isCheckedOut
            ? '#64748B'
            : todayStatus.isCheckedIn
            ? '#059669'
            : '#4F46E5'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.6875rem', letterSpacing: '0.06em' }}>
              Current Shift Status
            </div>
            <div className="fw-bold fs-6 mt-1">
              {!todayStatus.isCheckedIn ? (
                <span className="text-secondary">
                  Shift not started yet today. Click "Clock In Now" to begin recording your shift.
                </span>
              ) : !todayStatus.isCheckedOut ? (
                <span className="text-success d-inline-flex align-items-center gap-2">
                  <span>Active Shift: Clocked in at <strong>{formatTime(todayStatus.record?.checkInTime)}</strong></span>
                  <StatusBadge status={todayStatus.record?.status || 'PRESENT'} />
                </span>
              ) : (
                <span className="text-dark">
                  Shift Completed: In at <strong>{formatTime(todayStatus.record?.checkInTime)}</strong>, Out at{' '}
                  <strong>{formatTime(todayStatus.record?.checkOutTime)}</strong> (
                  <span className="font-monospace text-primary">{todayStatus.record?.totalHours}h</span>)
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="badge bg-light text-secondary border px-3 py-1.5 font-monospace">
              Standard Target: 8.0h / day
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center h-100">
            <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6875rem' }}>
              Days Present
            </span>
            <span className="fs-3 fw-bold text-success font-monospace">{summary.presentCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center h-100">
            <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6875rem' }}>
              Late Arrivals
            </span>
            <span className="fs-3 fw-bold text-warning font-monospace">{summary.lateCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center h-100">
            <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6875rem' }}>
              Half Days
            </span>
            <span className="fs-3 fw-bold text-info font-monospace">{summary.halfDayCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center h-100">
            <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6875rem' }}>
              Avg Working Hours
            </span>
            <span className="fs-3 fw-bold text-primary font-monospace">{summary.avgWorkingHours}h</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="ss-card p-0 overflow-hidden shadow-sm">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Attendance History Records
          </h2>
          <span className="text-muted small">Total Records: {history.length}</span>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Fetching personal attendance logs..." size="md" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <EmptyState
              icon="calendar"
              title="No Attendance History"
              description="No punch records found for this period. Clock in to begin recording your shift history."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                  <th className="pe-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row._id || row.id}>
                    <td className="ps-4 fw-semibold text-dark">{formatDate(row.date)}</td>
                    <td>{formatTime(row.checkInTime)}</td>
                    <td>{formatTime(row.checkOutTime)}</td>
                    <td>
                      <span className="badge bg-light text-secondary border font-monospace">
                        {row.totalHours ? `${row.totalHours}h` : row.checkOutTime ? '0.0h' : 'In Progress'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="text-muted small pe-4">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceLog;
