import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import leaveService from '../../api/leaveService.js';
import employeeService from '../../api/employeeService.js';
import attendanceService from '../../api/attendanceService.js';

export const ManagerDashboard = () => {
  const { currentUser } = useAuth();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [leaveRes, empRes, attRes] = await Promise.allSettled([
          leaveService.getPendingApprovals(),
          employeeService.getAll(),
          attendanceService.getTeamAttendance ? attendanceService.getTeamAttendance() : attendanceService.getAdminTodayAttendance()
        ]);

        if (!isMounted) return;

        const unwrap = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.data)) return res.data;
          return [];
        };

        if (leaveRes.status === 'fulfilled') {
          setPendingRequests(unwrap(leaveRes.value));
        }
        if (empRes.status === 'fulfilled') {
          setTeamMembers(unwrap(empRes.value));
        }
        if (attRes.status === 'fulfilled') {
          setTeamAttendance(unwrap(attRes.value));
        }
      } catch (err) {
        console.error('Failed to load manager dashboard metrics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const presentCount = teamAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;

  return (
    <div>
      <PageHeader
        title="Manager Supervision Portal"
        subtitle="Department team overview, daily check-in monitoring, and leave request review."
        breadcrumbs={[{ label: 'Manager Dashboard', path: '/dashboard/manager' }]}
        actionButton={
          <Link to="/leaves/approvals" className="btn btn-accent btn-sm">
            <Icon name="inbox" size={16} />
            <span>Review Pending Leaves ({pendingRequests.length})</span>
          </Link>
        }
      />

      {isLoading ? (
        <div className="ss-card p-5 text-center my-4">
          <LoadingSpinner label="Loading team dashboard data..." size="md" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <SummaryCard
                label="Total Staff Directory"
                value={String(teamMembers.length)}
                icon="users"
                variant="indigo"
                changeText={`${teamMembers.filter(e => e.status === 'ACTIVE').length} Active personnel`}
              />
            </div>
            <div className="col-12 col-md-4">
              <SummaryCard
                label="Team Present Today"
                value={String(presentCount)}
                icon="clock"
                variant="emerald"
                changeText={presentCount > 0 ? 'Logged punches verified' : 'No punches recorded today'}
              />
            </div>
            <div className="col-12 col-md-4">
              <SummaryCard
                label="Pending Leave Requests"
                value={String(pendingRequests.length)}
                icon="inbox"
                variant={pendingRequests.length > 0 ? 'amber' : 'emerald'}
                changeText={pendingRequests.length > 0 ? 'Requires decision approval' : 'All requests up to date'}
              />
            </div>
          </div>

          {/* Team Pending Leave Approvals Table */}
          <div className="ss-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Pending Leave Applications
                </h3>
                <p className="text-muted small mb-0">Decisions requiring manager authorization</p>
              </div>
              <Link to="/leaves/approvals" className="small fw-semibold text-decoration-none d-flex align-items-center gap-1">
                <span>View All In Queue</span>
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <EmptyState
                icon="check-circle"
                title="All Decisions Completed"
                description="There are currently zero pending leave requests awaiting your review."
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.slice(0, 5).map((req) => {
                      const reqId = req._id || req.id;
                      const empName = req.employeeId?.fullName ||
                        `${req.employeeId?.firstName || ''} ${req.employeeId?.lastName || ''}`.trim() ||
                        'Staff Member';

                      return (
                        <tr key={reqId}>
                          <td>
                            <div className="fw-bold text-dark">{empName}</div>
                            <div className="text-muted small">{req.employeeId?.designation || 'Staff'}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {req.leaveType}
                            </span>
                          </td>
                          <td>
                            <span className="fw-semibold">{req.daysCount}</span> {req.daysCount === 1 ? 'day' : 'days'}
                          </td>
                          <td className="small text-muted">
                            {formatDate(req.startDate)} → {formatDate(req.endDate)}
                          </td>
                          <td className="small text-truncate" style={{ maxWidth: '200px' }}>
                            {req.reason || '—'}
                          </td>
                          <td className="text-end">
                            <Link to="/leaves/approvals" className="btn btn-sm btn-outline-primary py-1 px-2.5">
                              Decide
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
