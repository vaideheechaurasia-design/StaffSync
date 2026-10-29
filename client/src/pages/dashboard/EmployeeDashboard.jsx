import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import attendanceService from '../../api/attendanceService.js';
import leaveService from '../../api/leaveService.js';

export const EmployeeDashboard = () => {
  const { currentUser } = useAuth();

  const [attendance, setAttendance] = useState({
    isCheckedIn: false,
    isCheckedOut: false,
    record: null
  });
  const [balance, setBalance] = useState({
    annual: { quota: 15, used: 0 },
    casual: { quota: 10, used: 0 },
    sick: { quota: 10, used: 0 },
    unpaid: { used: 0 }
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPunch, setIsSubmittingPunch] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [attRes, balRes, leavesRes] = await Promise.allSettled([
        attendanceService.getTodayStatus(),
        leaveService.getMyBalance(),
        leaveService.getMyLeaves({ limit: 5 })
      ]);

      if (attRes.status === 'fulfilled' && attRes.value?.data) {
        setAttendance(attRes.value.data);
      }
      if (balRes.status === 'fulfilled' && balRes.value?.data) {
        setBalance(balRes.value.data);
      }
      if (leavesRes.status === 'fulfilled' && leavesRes.value?.data) {
        setRecentLeaves(leavesRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching employee dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Automatic Live Attendance Monitoring: 30s background sync
    const intervalId = setInterval(async () => {
      try {
        const attRes = await attendanceService.getTodayStatus();
        if (attRes && attRes.data) {
          setAttendance(attRes.data);
        }
      } catch (_) {}
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handlePunchAction = async () => {
    setIsSubmittingPunch(true);
    setStatusMessage(null);
    try {
      if (!attendance.isCheckedIn) {
        // Perform Check-in
        const res = await attendanceService.checkIn('Daily portal web check-in');
        setStatusMessage({ type: 'success', text: 'Checked in successfully! Shift registered.' });
      } else if (!attendance.isCheckedOut) {
        // Perform Check-out
        const res = await attendanceService.checkOut('Daily portal web check-out');
        setStatusMessage({ type: 'success', text: 'Checked out successfully! Total working hours calculated.' });
      }
      // Refresh status
      const updated = await attendanceService.getTodayStatus();
      if (updated && updated.data) {
        setAttendance(updated.data);
      }
    } catch (err) {
      setStatusMessage({
        type: 'danger',
        text: err.response?.data?.message || err.message || 'Action failed. Please try again.'
      });
    } finally {
      setIsSubmittingPunch(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <PageHeader
        title="Employee Self-Service Portal"
        subtitle="Record daily attendance, inspect your remaining leave quotas, and browse company news."
        breadcrumbs={[{ label: 'Employee Dashboard', path: '/dashboard/employee' }]}
        actionButton={
          <Link to="/leaves/apply" className="btn btn-accent btn-sm">
            <Icon name="plus" size={16} />
            <span>Apply for Leave</span>
          </Link>
        }
      />

      {statusMessage && (
        <div className={`alert alert-${statusMessage.type} alert-dismissible fade show d-flex align-items-center gap-2 mb-4`} role="alert">
          <Icon name={statusMessage.type === 'success' ? 'check-circle' : 'alert-circle'} size={18} />
          <div>{statusMessage.text}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setStatusMessage(null)} aria-label="Close" />
        </div>
      )}

      {isLoading ? (
        <div className="ss-card p-5 text-center my-4">
          <LoadingSpinner label="Loading your personal workspace..." size="md" />
        </div>
      ) : (
        <>
          {/* Top Row: Daily Punch Widget & Leave Quotas */}
          <div className="row g-4 mb-4">
            {/* Interactive Punch Clock Widget */}
            <div className="col-lg-5">
              <div className="ss-card p-4 h-100 text-center d-flex flex-column justify-content-between position-relative overflow-hidden">
                <div className="position-relative z-1">
                  <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
                    Today's Work Shift
                  </span>
                  <h2 className="h4 fw-bold mt-1 mb-2" style={{ color: 'var(--ss-color-primary)' }}>
                    {todayFormatted}
                  </h2>

                  <div className="my-3">
                    {attendance.isCheckedOut ? (
                      <StatusBadge status="ACTIVE" className="px-3 py-1.5" />
                    ) : attendance.isCheckedIn ? (
                      <StatusBadge status="PRESENT" className="px-3 py-1.5" />
                    ) : (
                      <span className="badge bg-light text-muted border px-3 py-1.5">
                        Shift Not Started
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-3 bg-light border my-3 text-start small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Clock-in Time:</span>
                      <strong className="text-dark">
                        {attendance.record?.checkInTime ? formatTime(attendance.record.checkInTime) : 'Not recorded'}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Clock-out Time:</span>
                      <strong className="text-dark">
                        {attendance.record?.checkOutTime ? formatTime(attendance.record.checkOutTime) : 'Not recorded'}
                      </strong>
                    </div>
                    {attendance.record?.workHours !== undefined && (
                      <div className="d-flex justify-content-between border-top pt-1 mt-1">
                        <span className="text-muted">Total Hours:</span>
                        <strong className="text-primary">{attendance.record.workHours} hrs</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    className={`btn btn-lg w-100 py-3 fw-bold shadow-sm ${
                      attendance.isCheckedOut
                        ? 'btn-outline-secondary'
                        : attendance.isCheckedIn
                        ? 'btn-outline-danger'
                        : 'btn-accent'
                    }`}
                    onClick={handlePunchAction}
                    disabled={isSubmittingPunch || attendance.isCheckedOut}
                  >
                    {isSubmittingPunch ? (
                      <span>Recording...</span>
                    ) : attendance.isCheckedOut ? (
                      <span className="d-flex align-items-center justify-content-center gap-1.5">
                        <Icon name="check" size={16} />
                        <span>Completed Shift for Today</span>
                      </span>
                    ) : attendance.isCheckedIn ? (
                      <>
                        <Icon name="clock" size={18} />
                        <span>Clock Out (End Shift)</span>
                      </>
                    ) : (
                      <>
                        <Icon name="clock" size={18} />
                        <span>Clock In Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Leave Quota Balances Summary */}
            <div className="col-lg-7">
              <div className="ss-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      2026 Annual Leave Quotas
                    </h3>
                    <p className="text-muted small mb-0">Your remaining time-off allocation</p>
                  </div>
                  <Link to="/leaves" className="small fw-semibold text-decoration-none d-flex align-items-center gap-1">
                    <span>Full History</span>
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>

                <div className="row g-3">
                  <div className="col-sm-4">
                    <div className="p-3 rounded-3 border bg-light h-100 text-center">
                      <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.6875rem' }}>
                        Annual Leave
                      </div>
                      <div className="h3 fw-bold mb-1 text-primary">
                        {(balance.annual?.quota || 15) - (balance.annual?.used || 0)}
                      </div>
                      <div className="text-muted small">
                        of {balance.annual?.quota || 15} days remaining
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="p-3 rounded-3 border bg-light h-100 text-center">
                      <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.6875rem' }}>
                        Casual Leave
                      </div>
                      <div className="h3 fw-bold mb-1 text-warning">
                        {(balance.casual?.quota || 10) - (balance.casual?.used || 0)}
                      </div>
                      <div className="text-muted small">
                        of {balance.casual?.quota || 10} days remaining
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="p-3 rounded-3 border bg-light h-100 text-center">
                      <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.6875rem' }}>
                        Sick Leave
                      </div>
                      <div className="h3 fw-bold mb-1 text-success">
                        {(balance.sick?.quota || 10) - (balance.sick?.used || 0)}
                      </div>
                      <div className="text-muted small">
                        of {balance.sick?.quota || 10} days remaining
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    Need time off? Submit your dates in advance for manager approval.
                  </span>
                  <Link to="/leaves/apply" className="btn btn-sm btn-outline-primary">
                    <Icon name="plus" size={14} />
                    <span>Apply Now</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
