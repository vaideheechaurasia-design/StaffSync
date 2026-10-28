import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
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
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setError(null);
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
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load attendance logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const handlePunchAction = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!todayStatus.isCheckedIn) {
        // Clock In
        const res = await attendanceService.checkIn('Office Console Check-In');
        setSuccessMsg(res.message || 'Successfully clocked in for today!');
      } else if (!todayStatus.isCheckedOut) {
        // Clock Out
        const res = await attendanceService.checkOut('Shift Completed');
        setSuccessMsg(res.message || 'Successfully clocked out for today!');
      }
      await fetchAttendanceData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Attendance action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
        title="Personal Attendance Log"
        subtitle="Daily clock-in/out console, working hour calculations, and monthly punch history."
        breadcrumbs={[{ label: 'Attendance', path: '/attendance' }]}
        actionButton={
          <button
            type="button"
            className={`btn btn-sm ${
              todayStatus.isCheckedOut
                ? 'btn-outline-secondary'
                : todayStatus.isCheckedIn
                ? 'btn-outline-danger'
                : 'btn-accent'
            }`}
            onClick={handlePunchAction}
            disabled={actionLoading || (todayStatus.isCheckedIn && todayStatus.isCheckedOut)}
          >
            {actionLoading ? (
              <span>⏳ Processing...</span>
            ) : todayStatus.isCheckedOut ? (
              <span>✓ Completed Today</span>
            ) : todayStatus.isCheckedIn ? (
              <span>⏱️ Clock Out</span>
            ) : (
              <span>⏰ Clock In</span>
            )}
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Notice: </strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success: </strong> {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Today Punch Status Banner */}
      <div className="ss-card p-3 mb-4 border-start border-4 border-primary">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <div className="small text-muted text-uppercase fw-semibold" style={{ letterSpacing: '0.05em' }}>
              Today's Punch Status
            </div>
            <div className="fw-bold fs-6">
              {!todayStatus.isCheckedIn ? (
                <span className="text-muted">Not clocked in yet today. Click "⏰ Clock In" above to start your shift.</span>
              ) : !todayStatus.isCheckedOut ? (
                <span className="text-success">
                  Active Shift: Clocked in at <strong>{formatTime(todayStatus.record?.checkInTime)}</strong>{' '}
                  <StatusBadge status={todayStatus.record?.status || 'PRESENT'} className="ms-2" />
                </span>
              ) : (
                <span className="text-secondary">
                  Shift Completed: Clocked in at <strong>{formatTime(todayStatus.record?.checkInTime)}</strong>, clocked out at{' '}
                  <strong>{formatTime(todayStatus.record?.checkOutTime)}</strong> (
                  <span className="font-monospace">{todayStatus.record?.totalHours}h</span>)
                </span>
              )}
            </div>
          </div>
          <div className="text-md-end">
            <span className="badge bg-light text-dark border">
              Target Shift: 8.0h / day
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Bar */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Days Present</span>
            <span className="fs-4 fw-bold text-success">{summary.presentCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Late Arrivals</span>
            <span className="fs-4 fw-bold text-warning">{summary.lateCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Half Days</span>
            <span className="fs-4 fw-bold text-info">{summary.halfDayCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Avg Working Hours</span>
            <span className="fs-4 fw-bold text-primary">{summary.avgWorkingHours}h</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Attendance History Records
          </h2>
          <span className="text-muted small">Total Records: {history.length}</span>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Loading attendance history..." size="md" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <div className="fs-2 mb-2">📅</div>
            <p className="mb-0">No attendance records found yet. Clock in to begin your attendance trail.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row._id || row.id}>
                    <td className="ps-3 fw-semibold">{formatDate(row.date)}</td>
                    <td>{formatTime(row.checkInTime)}</td>
                    <td>{formatTime(row.checkOutTime)}</td>
                    <td>
                      <span className="font-monospace">
                        {row.totalHours ? `${row.totalHours}h` : row.checkOutTime ? '0.0h' : 'In Progress'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="text-muted small">{row.notes || '—'}</td>
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
