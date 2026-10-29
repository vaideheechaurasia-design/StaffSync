import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import employeeService from '../../api/employeeService.js';
import departmentService from '../../api/departmentService.js';
import attendanceService from '../../api/attendanceService.js';
import leaveService from '../../api/leaveService.js';

export const HRDashboard = () => {
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  // Action Center State
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');

  const unwrapData = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const getTodayAttPromise = typeof attendanceService.getAdminTodayAttendance === 'function'
        ? attendanceService.getAdminTodayAttendance()
        : attendanceService.getAllAttendance({ date: new Date().toISOString().split('T')[0] });

      const [empRes, deptRes, attRes, leaveRes] = await Promise.allSettled([
        employeeService.getAll(),
        departmentService.getAll(),
        getTodayAttPromise,
        leaveService.getPendingApprovals()
      ]);

      const failures = [];

      if (empRes.status === 'fulfilled') {
        setEmployees(unwrapData(empRes.value));
      } else {
        failures.push(`Employees (${empRes.reason?.message || 'Failed'})`);
      }

      if (deptRes.status === 'fulfilled') {
        setDepartments(unwrapData(deptRes.value));
      } else {
        failures.push(`Departments (${deptRes.reason?.message || 'Failed'})`);
      }

      if (attRes.status === 'fulfilled') {
        setAttendanceRecords(unwrapData(attRes.value));
      } else {
        failures.push(`Attendance (${attRes.reason?.message || 'Failed'})`);
      }

      if (leaveRes.status === 'fulfilled') {
        setPendingLeaves(unwrapData(leaveRes.value));
      } else {
        failures.push(`Leave Queue (${leaveRes.reason?.message || 'Failed'})`);
      }

      if (failures.length > 0) {
        setFetchError(`Some metrics could not be synchronized: ${failures.join(', ')}`);
      }
    } catch (err) {
      console.error('Error loading HR dashboard analytics:', err);
      setFetchError(err.message || 'Failed to load organizational analytics from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Automatic Live Attendance & Action Center Monitoring: 30s background sync
    const timerId = setInterval(() => {
      const pollAtt = typeof attendanceService.getAdminTodayAttendance === 'function'
        ? attendanceService.getAdminTodayAttendance()
        : attendanceService.getAllAttendance({ date: new Date().toISOString().split('T')[0] });

      pollAtt
        .then((res) => {
          const list = unwrapData(res);
          if (list) setAttendanceRecords(list);
        })
        .catch(() => {});

      leaveService.getPendingApprovals()
        .then((res) => {
          const list = unwrapData(res);
          if (list) setPendingLeaves(list);
        })
        .catch(() => {});
    }, 30000);

    return () => clearInterval(timerId);
  }, []);

  const handleInlineApprove = async (req) => {
    const empName = req.employeeId ? `${req.employeeId.firstName} ${req.employeeId.lastName}` : 'the employee';
    if (!window.confirm(`Authorize ${req.leaveType} (${req.totalDays} days) for ${empName}?`)) {
      return;
    }
    setActionLoading(true);
    setActionNotice(null);
    try {
      await leaveService.review(req._id, {
        status: 'APPROVED',
        reviewComment: 'Approved via HR Intelligence Action Center.'
      });
      setPendingLeaves((prev) => prev.filter((item) => item._id !== req._id));
      setActionNotice({ type: 'success', text: `Approved leave application for ${empName}.` });
    } catch (err) {
      setActionNotice({ type: 'danger', text: err.response?.data?.message || err.message || 'Approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInlineRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingItem || !rejectionComment.trim()) return;

    setActionLoading(true);
    setActionNotice(null);
    try {
      await leaveService.review(rejectingItem._id, {
        status: 'REJECTED',
        reviewComment: rejectionComment.trim()
      });
      setPendingLeaves((prev) => prev.filter((item) => item._id !== rejectingItem._id));
      setActionNotice({ type: 'success', text: 'Leave application has been rejected with feedback.' });
      setRejectingItem(null);
      setRejectionComment('');
    } catch (err) {
      setActionNotice({ type: 'danger', text: err.response?.data?.message || err.message || 'Rejection failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Compute live statistics from database records
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length;
  const onLeaveEmployees = employees.filter((e) => e.status === 'ON_LEAVE').length;
  const presentToday = attendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateToday = attendanceRecords.filter((a) => a.status === 'LATE').length;
  const pendingLeaveCount = pendingLeaves.length;

  const todayDay = new Date().getDay();
  const isWeekendToday = (todayDay === 0 || todayDay === 6);
  const attendanceRate = totalEmployees > 0
    ? (isWeekendToday && presentToday === 0 ? 100 : Math.round((presentToday / (activeEmployees || totalEmployees)) * 100))
    : 0;

  // Compute departmental distribution from actual employee array
  const departmentStats = departments.map((dept) => {
    const deptId = String(dept._id || dept.id || '');
    const deptEmps = employees.filter((emp) => {
      const eDept = emp.departmentId;
      const eDeptId = String(eDept?._id || eDept?.id || eDept || '');
      return eDeptId && eDeptId === deptId;
    });
    const count = deptEmps.length;
    const activeCount = deptEmps.filter((e) => e.status === 'ACTIVE').length;
    return {
      ...dept,
      headcount: count,
      activeHeadcount: activeCount
    };
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="ss-card p-4 p-md-5 mb-4 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
          borderRadius: '16px'
        }}
      >
        <div className="position-relative z-1">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span className="badge bg-indigo-500 bg-opacity-25 text-white mb-2 px-3 py-1.5 rounded-pill border border-indigo-400 border-opacity-30" style={{ fontSize: '0.75rem' }}>
                <Icon name="sparkles" size={13} className="me-1 text-warning" />
                StaffSync HR Intelligence Portal
              </span>
              <h1 className="h2 fw-bold text-white mb-1">
                {greeting()}, {currentUser?.firstName || currentUser?.name || 'Administrator'}
              </h1>
              <p className="text-white-50 mb-0" style={{ fontSize: '0.9rem' }}>
                Today is {todayFormatted} • All organizational systems operational and synced with MongoDB Atlas.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/employees/create" className="btn btn-accent btn-sm px-3 shadow">
                <Icon name="user-plus" size={16} />
                <span>Onboard Employee</span>
              </Link>
              <Link to="/attendance/admin" className="btn btn-outline-light btn-sm px-3">
                <Icon name="clock" size={16} />
                <span>Punch Logs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 shadow-sm" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
          <div className="d-flex align-items-center gap-2">
            <Icon name="alert-circle" size={18} color="#D97706" />
            <span className="small fw-medium">{fetchError}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-dark py-1 px-3 d-flex align-items-center gap-1"
            onClick={loadDashboardData}
          >
            <Icon name="refresh-cw" size={13} />
            <span>Retry Sync</span>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="ss-card p-5 text-center my-4">
          <LoadingSpinner label="Fetching live organization metrics from Atlas..." size="md" />
        </div>
      ) : (
        <>
          {/* KPI Metric Summary Grid */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <SummaryCard
                label="Total Headcount"
                value={String(totalEmployees)}
                icon="users"
                variant="indigo"
                changeText={`${activeEmployees} Active staff • ${onLeaveEmployees} On Leave`}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <SummaryCard
                label="Present Today"
                value={String(presentToday)}
                icon="clock"
                variant="emerald"
                changeText={
                  isWeekendToday && presentToday === 0
                    ? 'Weekend / Scheduled rest'
                    : lateToday > 0
                    ? `${lateToday} late arrival recorded`
                    : presentToday === 0
                    ? `0 of ${activeEmployees || totalEmployees} clocked in today`
                    : `${attendanceRate}% shift compliance`
                }
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <SummaryCard
                label="Active Departments"
                value={String(departments.length)}
                icon="building"
                variant="blue"
                changeText="Structured operational units"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <Link to="/leaves/approvals" className="text-decoration-none">
                <SummaryCard
                  label="Pending Leaves"
                  value={String(pendingLeaveCount)}
                  icon="inbox"
                  variant={pendingLeaveCount > 0 ? 'amber' : 'emerald'}
                  changeText={pendingLeaveCount > 0 ? 'Awaiting administrative review' : 'All requests reviewed'}
                />
              </Link>
            </div>
          </div>

          {actionNotice && (
            <div
              className={`alert alert-${actionNotice.type} alert-dismissible fade show d-flex align-items-center gap-2 mb-4`}
              role="alert"
            >
              <Icon name={actionNotice.type === 'success' ? 'check-circle' : 'alert-circle'} size={18} />
              <div className="small fw-medium">{actionNotice.text}</div>
              <button
                type="button"
                className="btn-close ms-auto"
                onClick={() => setActionNotice(null)}
                aria-label="Close"
              />
            </div>
          )}

          {/* Executive Action Center: Pending Leave Authorizations & Exceptions */}
          <div className="ss-card p-4 mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #4F46E5' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-2 flex-shrink-0" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                  <Icon name="check-circle" size={18} />
                </div>
                <div>
                  <h2 className="h6 fw-bold mb-0 text-dark">Executive Action Center</h2>
                  <p className="text-muted small mb-0">Direct authorization pipeline and workforce exception alerts</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${pendingLeaveCount > 0 ? 'bg-warning text-dark' : 'bg-success text-white'} rounded-pill px-2.5 py-1`}>
                  {pendingLeaveCount > 0 ? `${pendingLeaveCount} Requests Pending` : 'All Actions Cleared'}
                </span>
                <Link to="/leaves/approvals" className="btn btn-outline-secondary btn-sm py-1 px-2.5" style={{ fontSize: '0.75rem' }}>
                  <span>Full Queue</span>
                  <Icon name="arrow-right" size={13} className="ms-1" />
                </Link>
              </div>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-3 bg-light rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <Icon name="check" size={16} color="#10B981" />
                  <span>Queue is fully up to date. Zero employee leave requests awaiting administrative authorization.</span>
                </div>
                <Link to="/attendance/admin" className="small fw-semibold text-decoration-none">
                  Inspect Attendance Logs →
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Employee</th>
                      <th>Leave Type</th>
                      <th>Date Span</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th className="text-end pe-3">Direct Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.slice(0, 4).map((req) => {
                      const emp = req.employeeId || {};
                      const fullName = emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Staff Member';
                      const initials = emp.firstName ? `${emp.firstName[0]}${emp.lastName?.[0] || ''}` : 'U';

                      return (
                        <tr key={req._id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ width: '28px', height: '28px', backgroundColor: '#334155', fontSize: '0.7rem' }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{fullName}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {emp.employeeCode || '—'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-primary border font-monospace">
                              {req.leaveType}
                            </span>
                          </td>
                          <td className="fw-medium text-dark">
                            {formatDate(req.startDate)} – {formatDate(req.endDate)}
                          </td>
                          <td>
                            <span className="badge bg-light text-secondary border font-monospace">
                              {req.totalDays}d
                            </span>
                          </td>
                          <td className="text-truncate text-muted small" style={{ maxWidth: '200px' }} title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="text-end pe-3">
                            <div className="d-inline-flex gap-1.5">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success py-1 px-2.5 d-flex align-items-center gap-1"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleInlineApprove(req)}
                                disabled={actionLoading}
                                title="Approve leave request"
                              >
                                <Icon name="check" size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger py-1 px-2.5 d-flex align-items-center gap-1"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => {
                                  setRejectingItem(req);
                                  setRejectionComment('');
                                }}
                                disabled={actionLoading}
                                title="Reject leave request"
                              >
                                <Icon name="x" size={13} />
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Department Breakdown & Quick Operations */}
          <div className="row g-4 mb-4">
            {/* Department Overview */}
            <div className="col-lg-7">
              <div className="ss-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Department Distribution
                    </h3>
                    <p className="text-muted small mb-0">Active staff allocation per business unit</p>
                  </div>
                  <Link to="/departments" className="small fw-semibold text-decoration-none d-flex align-items-center gap-1">
                    <span>Manage</span>
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>

                {departments.length === 0 ? (
                  <div className="py-4 text-center text-muted small">
                    No departments recorded in the system.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>Code</th>
                          <th>Headcount</th>
                          <th>Capacity Share</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStats.map((dept) => {
                          const percent = totalEmployees > 0
                            ? Math.round((dept.headcount / totalEmployees) * 100)
                            : 0;

                          return (
                            <tr key={dept._id || dept.id}>
                              <td>
                                <strong className="text-dark">{dept.name}</strong>
                              </td>
                              <td>
                                <span className="badge bg-light text-secondary border font-monospace">
                                  {dept.code}
                                </span>
                              </td>
                              <td>
                                <span className="fw-semibold">{dept.headcount}</span> {dept.headcount === 1 ? 'member' : 'members'}
                                {dept.headcount > 0 && dept.headcount !== dept.activeHeadcount && (
                                  <span className="text-muted small ms-1">({dept.activeHeadcount} active)</span>
                                )}
                              </td>
                              <td style={{ minWidth: '120px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${percent}%`,
                                        backgroundColor: '#4F46E5'
                                      }}
                                      aria-valuenow={percent}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    />
                                  </div>
                                  <span className="text-muted small" style={{ minWidth: '28px' }}>
                                    {percent}%
                                  </span>
                                </div>
                              </td>
                              <td>
                                <StatusBadge status={dept.isActive ? 'ACTIVE' : 'INACTIVE'} />
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

            {/* Quick HR Operations */}
            <div className="col-lg-5">
              <div className="ss-card p-4 h-100">
                <h3 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Quick HR Operations
                </h3>
                <p className="text-muted small mb-3">Frequently executed workflows</p>

                <div className="d-flex flex-column gap-2.5">
                  <Link
                    to="/employees/create"
                    className="p-3 rounded-3 border d-flex align-items-center gap-3 text-decoration-none hover-bg-light transition"
                    style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
                  >
                    <div className="rounded-2 p-2 bg-indigo-50 text-indigo-600 flex-shrink-0" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                      <Icon name="user-plus" size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                        Onboard New Employee
                      </div>
                      <div className="text-muted small">
                        Provision User account and complete employee file
                      </div>
                    </div>
                    <Icon name="chevron-right" size={16} color="#94A3B8" />
                  </Link>

                  <Link
                    to="/departments"
                    className="p-3 rounded-3 border d-flex align-items-center gap-3 text-decoration-none hover-bg-light transition"
                    style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
                  >
                    <div className="rounded-2 p-2 bg-blue-50 text-blue-600 flex-shrink-0" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                      <Icon name="building" size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                        Manage Departments
                      </div>
                      <div className="text-muted small">
                        Structure organizational units and assign managers
                      </div>
                    </div>
                    <Icon name="chevron-right" size={16} color="#94A3B8" />
                  </Link>

                  <Link
                    to="/leaves/approvals"
                    className="p-3 rounded-3 border d-flex align-items-center gap-3 text-decoration-none hover-bg-light transition"
                    style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
                  >
                    <div className="rounded-2 p-2 bg-amber-50 text-amber-600 flex-shrink-0" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                      <Icon name="inbox" size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                          Review Pending Leaves
                        </span>
                        {pendingLeaveCount > 0 && (
                          <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.6875rem' }}>
                            {pendingLeaveCount}
                          </span>
                        )}
                      </div>
                      <div className="text-muted small">
                        Decision pipeline for submitted time-off requests
                      </div>
                    </div>
                    <Icon name="chevron-right" size={16} color="#94A3B8" />
                  </Link>

                  <Link
                    to="/attendance/admin"
                    className="p-3 rounded-3 border d-flex align-items-center gap-3 text-decoration-none hover-bg-light transition"
                    style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
                  >
                    <div className="rounded-2 p-2 bg-emerald-50 text-emerald-600 flex-shrink-0" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                      <Icon name="clock" size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                        Attendance & Punch Logs
                      </div>
                      <div className="text-muted small">
                        Daily check-in verification and manual correction
                      </div>
                    </div>
                    <Icon name="chevron-right" size={16} color="#94A3B8" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl" style={{ borderRadius: '16px' }}>
              <form onSubmit={handleInlineRejectSubmit}>
                <div className="modal-header border-bottom py-3 px-4">
                  <h3 className="modal-title h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    <Icon name="x" size={18} color="#DC2626" />
                    <span>Reject Leave Application</span>
                  </h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setRejectingItem(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="p-3 rounded-3 bg-light border mb-3 small">
                    <span className="text-muted">Applicant: </span>
                    <strong className="text-dark">
                      {rejectingItem.employeeId?.firstName} {rejectingItem.employeeId?.lastName}
                    </strong>
                    <div className="text-muted mt-1">
                      Type: <strong>{rejectingItem.leaveType}</strong> • Duration: <strong>{rejectingItem.totalDays} days</strong>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label htmlFor="hrRejectionReason" className="form-label small fw-semibold">
                      Reason for Rejection <span className="text-danger">* (Required)</span>
                    </label>
                    <textarea
                      id="hrRejectionReason"
                      className="form-control"
                      rows="3"
                      placeholder="Explain why this request is rejected so the employee is informed..."
                      value={rejectionComment}
                      onChange={(e) => setRejectionComment(e.target.value)}
                      required
                    />
                    <div className="form-text small">Minimum 5 characters required.</div>
                  </div>
                </div>
                <div className="modal-footer border-top py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setRejectingItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm"
                    disabled={actionLoading || rejectionComment.trim().length < 5}
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
