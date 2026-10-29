import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import { exportToCSV } from '../../utils/csvExport.js';
import employeeService from '../../api/employeeService.js';
import departmentService from '../../api/departmentService.js';
import attendanceService from '../../api/attendanceService.js';
import leaveService from '../../api/leaveService.js';

export const HRReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const [empRes, deptRes, attRes, leaveRes] = await Promise.allSettled([
          employeeService.getAll(),
          departmentService.getAll(),
          attendanceService.getAllAttendance({ limit: 200 }),
          leaveService.getAll ? leaveService.getAll({ limit: 200 }) : leaveService.getPendingApprovals()
        ]);

        if (!isMounted) return;

        const unwrap = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.data)) return res.data;
          return [];
        };

        if (empRes.status === 'fulfilled') {
          setEmployees(unwrap(empRes.value));
        }
        if (deptRes.status === 'fulfilled') {
          setDepartments(unwrap(deptRes.value));
        }
        if (attRes.status === 'fulfilled') {
          setAttendanceRecords(unwrap(attRes.value));
        }
        if (leaveRes.status === 'fulfilled') {
          setLeaveRecords(unwrap(leaveRes.value));
        }
      } catch (err) {
        console.error('Error compiling analytics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAnalytics();
    return () => { isMounted = false; };
  }, []);

  // Compute live workforce metrics
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const onLeaveCount = employees.filter((e) => e.status === 'ON_LEAVE').length;
  const inactiveCount = employees.filter((e) => e.status === 'INACTIVE').length;

  // Employment type breakdown
  const fullTimeCount = employees.filter((e) => e.employmentType === 'FULL_TIME' || !e.employmentType).length;
  const partTimeCount = employees.filter((e) => e.employmentType === 'PART_TIME').length;
  const contractCount = employees.filter((e) => e.employmentType === 'CONTRACT').length;
  const internCount = employees.filter((e) => e.employmentType === 'INTERN').length;

  // Department distribution
  const departmentStats = departments.map((dept) => {
    const deptId = String(dept._id || dept.id || '');
    const deptEmps = employees.filter((emp) => {
      const eDeptId = String(emp.departmentId?._id || emp.departmentId?.id || emp.departmentId || '');
      return eDeptId === deptId;
    });
    const count = deptEmps.length;
    const activeHeadcount = deptEmps.filter((e) => e.status === 'ACTIVE').length;
    return {
      ...dept,
      headcount: count,
      activeHeadcount,
      percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0
    };
  });

  // Attendance metrics
  const presentCount = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'LATE').length;
  const halfDayCount = attendanceRecords.filter((r) => r.status === 'HALF_DAY').length;
  const totalHoursLogged = attendanceRecords.reduce((acc, r) => acc + (Number(r.totalHours) || 0), 0);
  const avgHours = attendanceRecords.length > 0 ? (totalHoursLogged / attendanceRecords.length).toFixed(1) : '0.0';

  // Leave metrics
  const approvedLeaves = leaveRecords.filter((l) => l.status === 'APPROVED').length;
  const pendingLeaves = leaveRecords.filter((l) => l.status === 'PENDING').length;
  const rejectedLeaves = leaveRecords.filter((l) => l.status === 'REJECTED').length;

  const handleExportStaff = () => {
    exportToCSV(`staffsync-workforce-${new Date().toISOString().split('T')[0]}.csv`, employees, [
      { key: 'employeeCode', label: 'Employee Code' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'designation', label: 'Title' },
      { key: 'departmentId.name', label: 'Department' },
      { key: 'status', label: 'Status' },
      { key: 'employmentType', label: 'Type' }
    ]);
  };

  const handleExportAttendance = () => {
    exportToCSV(`staffsync-attendance-audit-${new Date().toISOString().split('T')[0]}.csv`, attendanceRecords, [
      { key: 'date', label: 'Date' },
      { key: 'employeeId.employeeCode', label: 'Code' },
      { key: 'employeeId.firstName', label: 'First Name' },
      { key: 'employeeId.lastName', label: 'Last Name' },
      { key: 'checkInTime', label: 'Check In' },
      { key: 'checkOutTime', label: 'Check Out' },
      { key: 'totalHours', label: 'Hours' },
      { key: 'status', label: 'Status' }
    ]);
  };

  const handleExportLeaves = () => {
    exportToCSV(`staffsync-leaves-audit-${new Date().toISOString().split('T')[0]}.csv`, leaveRecords, [
      { key: 'leaveType', label: 'Type' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'totalDays', label: 'Days' },
      { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Status' }
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Advanced HR Analytics & Reports"
        subtitle="Live organizational metrics, department distribution, attendance compliance, and data exports."
        breadcrumbs={[{ label: 'HR Reports', path: '/reports' }]}
        badge="MongoDB Atlas Analytics"
        actionButton={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm shadow-xs d-flex align-items-center gap-1.5"
              onClick={handleExportStaff}
              disabled={employees.length === 0}
            >
              <Icon name="reports" size={14} />
              <span>Export Staff (CSV)</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm shadow-xs d-flex align-items-center gap-1.5"
              onClick={handleExportAttendance}
              disabled={attendanceRecords.length === 0}
            >
              <Icon name="clock" size={14} />
              <span>Export Attendance (CSV)</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm shadow-xs d-flex align-items-center gap-1.5"
              onClick={handleExportLeaves}
              disabled={leaveRecords.length === 0}
            >
              <Icon name="calendar" size={14} />
              <span>Export Leaves (CSV)</span>
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="ss-card p-5 text-center my-4">
          <LoadingSpinner label="Compiling organizational analytics from Atlas..." size="md" />
        </div>
      ) : (
        <>
          {/* Executive KPI Row */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <SummaryCard
                label="Registered Staff"
                value={String(totalEmployees)}
                icon="users"
                variant="indigo"
                changeText={`${activeCount} Active • ${onLeaveCount} On Leave`}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <SummaryCard
                label="Attendance Logs"
                value={String(attendanceRecords.length)}
                icon="clock"
                variant="emerald"
                changeText={`Avg ${avgHours}h per logged shift`}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <SummaryCard
                label="Active Departments"
                value={String(departments.length)}
                icon="building"
                variant="blue"
                changeText="Configured business units"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <SummaryCard
                label="Leave Applications"
                value={String(leaveRecords.length)}
                icon="calendar"
                variant={pendingLeaves > 0 ? 'amber' : 'emerald'}
                changeText={`${approvedLeaves} Approved • ${pendingLeaves} Pending`}
              />
            </div>
          </div>

          {/* Department Headcount Share & Employment Types */}
          <div className="row g-4 mb-4">
            {/* Department Breakdown */}
            <div className="col-lg-7">
              <div className="ss-card p-4 h-100 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Headcount Distribution by Department
                    </h3>
                    <p className="text-muted small mb-0">Live capacity allocation per business unit</p>
                  </div>
                </div>

                {departmentStats.length === 0 ? (
                  <div className="py-4 text-center text-muted small">
                    No departments available.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 py-2">
                    {departmentStats.map((d) => (
                      <div key={d._id || d.id}>
                        <div className="d-flex justify-content-between align-items-center mb-1 small">
                          <span className="fw-semibold text-dark">
                            {d.name} <span className="badge bg-light text-secondary border font-monospace ms-1">{d.code}</span>
                          </span>
                          <span className="text-muted">
                            <strong className="text-dark">{d.headcount}</strong> staff ({d.percentage}%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${d.percentage}%`,
                              background: 'var(--ss-color-accent-gradient)',
                              borderRadius: '4px'
                            }}
                            aria-valuenow={d.percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Employment Status & Type Breakdown */}
            <div className="col-lg-5">
              <div className="ss-card p-4 h-100 shadow-sm">
                <h3 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Workforce Composition
                </h3>
                <p className="text-muted small mb-3">Breakdown by contract and account status</p>

                <div className="p-3 rounded-3 bg-light border mb-3">
                  <div className="text-muted text-uppercase fw-bold small mb-2" style={{ fontSize: '0.6875rem' }}>
                    Contract Type Allocation
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom small">
                    <span>Full-Time Staff</span>
                    <strong className="text-dark font-monospace">{fullTimeCount}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom small">
                    <span>Contractors</span>
                    <strong className="text-dark font-monospace">{contractCount}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom small">
                    <span>Part-Time Staff</span>
                    <strong className="text-dark font-monospace">{partTimeCount}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 small">
                    <span>Interns</span>
                    <strong className="text-dark font-monospace">{internCount}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-light border">
                  <div className="text-muted text-uppercase fw-bold small mb-2" style={{ fontSize: '0.6875rem' }}>
                    Account Status Breakdown
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom small">
                    <span className="d-flex align-items-center gap-1.5">
                      <span className="ss-badge-dot" style={{ backgroundColor: '#10B981' }} />
                      <span>Active Accounts</span>
                    </span>
                    <strong className="text-success font-monospace">{activeCount}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom small">
                    <span className="d-flex align-items-center gap-1.5">
                      <span className="ss-badge-dot" style={{ backgroundColor: '#3B82F6' }} />
                      <span>On Approved Leave</span>
                    </span>
                    <strong className="text-primary font-monospace">{onLeaveCount}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 small">
                    <span className="d-flex align-items-center gap-1.5">
                      <span className="ss-badge-dot" style={{ backgroundColor: '#EF4444' }} />
                      <span>Deactivated Accounts</span>
                    </span>
                    <strong className="text-danger font-monospace">{inactiveCount}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Compliance & Leave Decision Pipeline */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="ss-card p-4 shadow-sm h-100">
                <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
                  <Icon name="clock" size={18} color="#059669" />
                  <h3 className="h6 fw-bold mb-0 text-uppercase text-dark">
                    Attendance Quality Breakdown
                  </h3>
                </div>
                <div className="row g-3 text-center my-2">
                  <div className="col-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-semibold">On-Time</div>
                      <div className="fs-3 fw-bold text-success font-monospace">{presentCount}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-semibold">Late Arrivals</div>
                      <div className="fs-3 fw-bold text-warning font-monospace">{lateCount}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-semibold">Half Days</div>
                      <div className="fs-3 fw-bold text-info font-monospace">{halfDayCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="ss-card p-4 shadow-sm h-100">
                <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
                  <Icon name="calendar" size={18} color="#D97706" />
                  <h3 className="h6 fw-bold mb-0 text-uppercase text-dark">
                    Leave Decisions Pipeline
                  </h3>
                </div>
                <div className="row g-3 text-center my-2">
                  <div className="col-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-semibold">Approved</div>
                      <div className="fs-3 fw-bold text-success font-monospace">{approvedLeaves}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-semibold">Pending Review</div>
                      <div className="fs-3 fw-bold text-warning font-monospace">{pendingLeaves}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-semibold">Rejected</div>
                      <div className="fs-3 fw-bold text-danger font-monospace">{rejectedLeaves}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HRReports;
