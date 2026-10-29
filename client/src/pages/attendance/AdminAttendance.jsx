import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import Icon from '../../components/common/Icon.jsx';
import { exportToCSV } from '../../utils/csvExport.js';
import attendanceService from '../../api/attendanceService.js';
import departmentService from '../../api/departmentService.js';
import employeeService from '../../api/employeeService.js';
import leaveService from '../../api/leaveService.js';

const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Active View Tab: 'logs' | 'departments' | 'timeline'
  const [activeViewTab, setActiveViewTab] = useState('logs');

  // Filters
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Auto-Refresh & Live Polling
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // 0 (off), 15, 30, 60
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // In-flight request lock
  const isFetchingRef = useRef(false);

  // Manual Punch Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalForm, setModalForm] = useState({
    employeeId: '',
    date: getTodayLocalDate(),
    checkInTime: '09:00',
    checkOutTime: '17:30',
    status: 'PRESENT',
    notes: 'HR administrative entry'
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: 30
      };
      if (selectedDate) params.date = selectedDate;
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedStatus) params.status = selectedStatus;

      const [attRes, leaveRes] = await Promise.all([
        attendanceService.getAllAttendance(params),
        leaveService.getAll({ status: 'APPROVED' }).catch(() => ({ data: [] }))
      ]);

      if (attRes && attRes.data) {
        setRecords(attRes.data);
        setTotalRecords(attRes.total || attRes.data.length);
        setTotalPages(attRes.totalPages || 1);
        setLastRefreshed(new Date());
      }
      if (leaveRes && leaveRes.data) {
        setApprovedLeaves(leaveRes.data);
      }
    } catch (err) {
      if (!isSilent) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch attendance logs.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [currentPage, selectedDate, selectedDept, selectedStatus]);

  // Initial metadata loading (Departments, Employees)
  useEffect(() => {
    Promise.all([
      departmentService.getAll().catch(() => ({ data: [] })),
      employeeService.getAll().catch(() => ({ data: [] }))
    ]).then(([deptRes, empRes]) => {
      if (deptRes && deptRes.data) setDepartments(deptRes.data);
      if (empRes && empRes.data) setEmployees(empRes.data);
    });
  }, []);

  // Primary load effect
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Live Auto-Refresh Polling Timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      loadData(true); // Silent background sync
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, loadData]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.employeeId) {
      setError('Please select an employee.');
      return;
    }

    setModalSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const checkInDateTime = new Date(`${modalForm.date}T${modalForm.checkInTime}:00`);
      const checkOutDateTime = modalForm.checkOutTime
        ? new Date(`${modalForm.date}T${modalForm.checkOutTime}:00`)
        : null;

      await attendanceService.createRecord({
        employeeId: modalForm.employeeId,
        date: modalForm.date,
        checkInTime: checkInDateTime.toISOString(),
        checkOutTime: checkOutDateTime ? checkOutDateTime.toISOString() : undefined,
        status: modalForm.status,
        notes: modalForm.notes
      });

      setSuccessMsg('Manual attendance record successfully registered in Atlas.');
      setShowManualModal(false);
      await loadData(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create manual attendance record.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'date', label: 'Date' },
      { key: 'employeeId.employeeCode', label: 'Employee Code' },
      { key: 'employeeId.firstName', label: 'First Name' },
      { key: 'employeeId.lastName', label: 'Last Name' },
      { key: 'employeeId.departmentId.name', label: 'Department' },
      { key: 'checkInTime', label: 'Check In' },
      { key: 'checkOutTime', label: 'Check Out' },
      { key: 'totalHours', label: 'Hours' },
      { key: 'status', label: 'Status' },
      { key: 'notes', label: 'Notes' }
    ];
    exportToCSV(`staffsync-attendance-${selectedDate || 'all'}.csv`, records, columns);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // -------------------------------------------------------------
  // REAL-TIME METRICS CALCULATIONS (Strictly Atlas Database Data)
  // -------------------------------------------------------------
  const targetDateStr = selectedDate || getTodayLocalDate();
  const targetDateObj = new Date(targetDateStr + 'T12:00:00');
  const dayOfWeek = isNaN(targetDateObj.getTime()) ? 1 : targetDateObj.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  const todayStr = getTodayLocalDate();
  const isPastDate = targetDateStr < todayStr;
  const isToday = targetDateStr === todayStr;

  // 1. Punched Records matching this date query
  const punchedRecords = records;
  const punchedEmployeeIds = new Set(
    punchedRecords
      .map((r) => {
        const id = r.employeeId?._id || r.employeeId?.id || r.employeeId;
        return id ? String(id) : null;
      })
      .filter(Boolean)
  );

  // Present, Late, Clocked-in, and Completed Shifts
  const clockedInRecords = punchedRecords.filter((r) => r.checkInTime);
  const checkedOutRecords = punchedRecords.filter((r) => r.checkInTime && r.checkOutTime);
  const completedShifts = punchedRecords.filter(
    (r) => (r.checkInTime && r.checkOutTime) || (Number(r.totalHours) >= 4)
  );
  const presentRecords = punchedRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE');
  const lateRecords = punchedRecords.filter((r) => r.status === 'LATE');

  // 2. Employees with an approved leave overlapping target date
  const employeesOnApprovedLeave = approvedLeaves.filter((l) => {
    if (l.status !== 'APPROVED') return false;
    const s = l.startDate ? new Date(l.startDate).toISOString().split('T')[0] : '';
    const e = l.endDate ? new Date(l.endDate).toISOString().split('T')[0] : '';
    return targetDateStr >= s && targetDateStr <= e;
  });
  const onLeaveEmployeeIds = new Set(
    employeesOnApprovedLeave
      .map((l) => {
        const id = l.employeeId?._id || l.employeeId?.id || l.employeeId;
        return id ? String(id) : null;
      })
      .filter(Boolean)
  );

  // 3. Filter eligible staff who were actually expected to work on the selected date
  const eligibleStaffOnDate = employees.filter((e) => {
    const eId = String(e._id || e.id || '');
    // If the employee actually has a recorded punch or approved leave on this date,
    // they are definitively accounted for as part of this date's active roster.
    if (punchedEmployeeIds.has(eId) || onLeaveEmployeeIds.has(eId)) {
      return true;
    }
    // Deactivated / Inactive employees are not part of the active schedule and cannot be absent
    if (String(e.status).toUpperCase() === 'INACTIVE') {
      return false;
    }
    // Employees who joined after this date were not yet employed
    if (e.dateOfJoining) {
      const joinDateStr = new Date(e.dateOfJoining).toISOString().split('T')[0];
      if (joinDateStr > targetDateStr) {
        return false;
      }
    }
    return true;
  });

  // 4. Absences: Only calculated on expected working days for eligible staff who did NOT punch and do NOT have approved leave
  // If it is a weekend, or a historical past date with zero records (no shift logs kept), we do NOT falsely infer delinquency.
  const hasRecordsLogged = punchedRecords.length > 0;
  const isNonWorkingDay = isWeekend;

  const absentees = (isNonWorkingDay || (isPastDate && !hasRecordsLogged))
    ? []
    : eligibleStaffOnDate.filter((e) => {
        const eId = String(e._id || e.id || '');
        return !punchedEmployeeIds.has(eId) && !onLeaveEmployeeIds.has(eId);
      });

  // 5. Punctuality Calculation with clearly defined denominator
  // Punctuality = (On-time arrivals / Total Present Arrivals) * 100
  // If zero arrivals, display 'N/A' to avoid misleading claims.
  const punctualityValue = presentRecords.length > 0
    ? `${Math.round(((presentRecords.length - lateRecords.length) / presentRecords.length) * 100)}%`
    : 'N/A';

  const punctualityNote = presentRecords.length > 0
    ? `${presentRecords.length - lateRecords.length} of ${presentRecords.length} on time`
    : isWeekend ? 'Weekend / No shifts' : 'No arrivals recorded';

  // 6. Department-Wise Attendance Aggregation (Reconciles exactly with eligible employee records)
  const departmentAttendanceMetrics = departments.map((dept) => {
    const deptId = String(dept._id || dept.id || '');
    const deptMembers = eligibleStaffOnDate.filter((emp) => {
      const eDept = emp.departmentId?._id || emp.departmentId?.id || emp.departmentId;
      return String(eDept || '') === deptId;
    });

    const totalInDept = deptMembers.length;
    let presentInDept = 0;
    let lateInDept = 0;
    let onLeaveInDept = 0;

    deptMembers.forEach((emp) => {
      const eId = String(emp._id || emp.id || '');
      if (punchedEmployeeIds.has(eId)) {
        const rec = punchedRecords.find((r) => {
          const rEmpId = String(r.employeeId?._id || r.employeeId?.id || r.employeeId || '');
          return rEmpId === eId;
        });
        if (rec?.status === 'LATE') lateInDept++;
        else presentInDept++;
      } else if (onLeaveEmployeeIds.has(eId)) {
        onLeaveInDept++;
      }
    });

    const absentInDept = (isNonWorkingDay || (isPastDate && !hasRecordsLogged))
      ? 0
      : Math.max(0, totalInDept - (presentInDept + lateInDept + onLeaveInDept));

    const totalAccounted = presentInDept + lateInDept + onLeaveInDept;
    const compliancePercent = totalInDept > 0
      ? (isNonWorkingDay ? 100 : Math.round((totalAccounted / totalInDept) * 100))
      : 100;

    return {
      department: dept,
      total: totalInDept,
      present: presentInDept,
      late: lateInDept,
      onLeave: onLeaveInDept,
      absent: absentInDept,
      compliancePercent
    };
  });

  // Chronological Activity Timeline Feed
  const chronologicalPunches = [...records].sort((a, b) => {
    const timeA = new Date(a.checkInTime || a.createdAt || 0).getTime();
    const timeB = new Date(b.checkInTime || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div>
      <PageHeader
        title="Live Attendance Monitoring & Analytics"
        subtitle="Real-time employee punch tracking, department rosters, absences, and shift duration compliance."
        breadcrumbs={[
          { label: 'Attendance', path: '/attendance' },
          { label: 'Live Monitor', path: '/attendance/admin' }
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
                aria-label="Select automatic refresh interval"
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
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              title="Poll latest punch logs from MongoDB Atlas"
            >
              <Icon name="refresh" size={14} className={isRefreshing ? 'rotate-animation' : ''} />
              <span>Sync</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm shadow-xs d-flex align-items-center gap-1.5"
              onClick={handleExportCSV}
              disabled={records.length === 0}
              title="Export filtered records to CSV"
            >
              <Icon name="download" size={14} />
              <span>Export CSV</span>
            </button>

            {/* Log Manual Punch */}
            <button
              type="button"
              className="btn btn-accent btn-sm shadow-sm d-flex align-items-center gap-1.5"
              onClick={() => setShowManualModal(true)}
            >
              <Icon name="plus" size={16} />
              <span>Log Manual Punch</span>
            </button>
          </div>
        }
      />

      {/* Sync Status Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 px-1 text-muted small gap-2">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: autoRefreshInterval > 0 ? '#10B981' : '#64748B',
              boxShadow: autoRefreshInterval > 0 ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          />
          <span className="fw-medium">
            {autoRefreshInterval > 0
              ? `Live Engine Active • Auto-syncing every ${autoRefreshInterval}s`
              : 'Auto-sync paused (manual sync mode)'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span>Target Date: <strong>{targetDateStr}</strong></span>
          <span>•</span>
          <span>Last polled: <strong>{lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong></span>
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

      {/* Weekend and Historical Context Notices */}
      {isWeekend && (
        <div className="alert alert-info py-2.5 px-3 mb-3 d-flex align-items-center gap-2 small shadow-2xs" role="status">
          <Icon name="info" size={16} color="#0284C7" />
          <span>
            Selected date (<strong>{targetDateStr}</strong>) is a scheduled weekend day. Standard working calendar does not require attendance unless special weekend shifts are logged.
          </span>
        </div>
      )}
      {isPastDate && !hasRecordsLogged && !isWeekend && (
        <div className="alert alert-warning py-2.5 px-3 mb-3 d-flex align-items-center gap-2 small shadow-2xs" role="status">
          <Icon name="alert-triangle" size={16} color="#D97706" />
          <span>
            No historical attendance logs recorded in the database for <strong>{targetDateStr}</strong>. Zero retroactive absences are inferred without shift schedule data.
          </span>
        </div>
      )}

      {/* 6 Key Real-Time Attendance Metrics (Strictly Atlas Data) */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-xl-2">
          <SummaryCard
            label="Clock In"
            value={String(clockedInRecords.length)}
            icon="clock"
            variant="emerald"
            changeText={
              lateRecords.length > 0
                ? `${lateRecords.length} late arrival recorded`
                : clockedInRecords.length > 0
                ? 'On-time arrivals'
                : 'No punches today'
            }
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <SummaryCard
            label="Checked Out"
            value={String(checkedOutRecords.length)}
            icon="attendance"
            variant="indigo"
            changeText={
              clockedInRecords.length > checkedOutRecords.length
                ? `${clockedInRecords.length - checkedOutRecords.length} active on floor`
                : checkedOutRecords.length > 0
                ? 'All shifts completed'
                : 'No checkouts yet'
            }
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <SummaryCard
            label="Completed Shifts"
            value={String(completedShifts.length)}
            icon="check-circle"
            variant="blue"
            changeText="Full shift duration"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <SummaryCard
            label="Approved Leave"
            value={String(employeesOnApprovedLeave.length)}
            icon="calendar"
            variant="amber"
            changeText="Authorized time-off"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <SummaryCard
            label="Absent"
            value={String(absentees.length)}
            icon="alert-circle"
            variant={absentees.length > 0 ? 'rose' : 'emerald'}
            changeText={
              isWeekend
                ? 'Non-working weekend'
                : (isPastDate && !hasRecordsLogged)
                ? 'No past logs kept'
                : isToday && clockedInRecords.length === 0
                ? 'Pending shift arrival'
                : 'Unexcused / no punch'
            }
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <SummaryCard
            label="Punctuality"
            value={punctualityValue}
            icon="sparkles"
            variant="indigo"
            changeText={punctualityNote}
          />
        </div>
      </div>

      {/* View Switcher Tabs & Filter Bar */}
      <div className="ss-card p-3 mb-4 shadow-sm bg-light border">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* View Mode Tabs */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${activeViewTab === 'logs' ? 'btn-primary' : 'btn-white border text-dark'} d-flex align-items-center gap-1.5 shadow-2xs`}
              onClick={() => setActiveViewTab('logs')}
            >
              <Icon name="clock" size={15} />
              <span>Punch Logs Table ({totalRecords})</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeViewTab === 'departments' ? 'btn-primary' : 'btn-white border text-dark'} d-flex align-items-center gap-1.5 shadow-2xs`}
              onClick={() => setActiveViewTab('departments')}
            >
              <Icon name="building" size={15} />
              <span>Department Visual Breakdown</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeViewTab === 'timeline' ? 'btn-primary' : 'btn-white border text-dark'} d-flex align-items-center gap-1.5 shadow-2xs`}
              onClick={() => setActiveViewTab('timeline')}
            >
              <Icon name="trending-up" size={15} />
              <span>Activity Timeline</span>
            </button>
          </div>

          {/* Quick Date Pills & Filters */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-white border px-2.5 py-1 text-muted"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setSelectedDate(getTodayLocalDate())}
            >
              Today
            </button>
            <input
              type="date"
              className="form-control form-control-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', fontSize: '0.75rem' }}
              aria-label="Filter by date"
            />
            <select
              className="form-select form-select-sm"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: 'auto', fontSize: '0.75rem' }}
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id || dept.id} value={dept._id || dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: 'auto', fontSize: '0.75rem' }}
              aria-label="Filter by punch status"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late Arrival</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: PUNCH LOGS TABLE */}
      {activeViewTab === 'logs' && (
        <div className="ss-card p-0 overflow-hidden shadow-sm mb-4">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Detailed Shift Punch Logs
            </h2>
            <span className="small text-muted">
              Displaying page {currentPage} of {totalPages}
            </span>
          </div>

          {isLoading ? (
            <div className="p-5 text-center">
              <LoadingSpinner label="Fetching live punch logs from MongoDB Atlas..." size="md" />
            </div>
          ) : records.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <EmptyState
                icon="clock"
                title="No Punch Records Recorded"
                description="Zero punch logs found matching the selected date and filters."
              />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Shift Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => {
                    const emp = rec.employeeId || {};
                    const dept = emp.departmentId || {};
                    const fullName = emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Staff Member';
                    const initials = emp.firstName ? `${emp.firstName[0]}${emp.lastName?.[0] || ''}` : 'U';

                    return (
                      <tr key={rec._id || rec.id}>
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
                                {emp.employeeCode || '—'} • {dept.name || 'Staff'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="fw-medium text-dark">{formatDate(rec.date)}</td>
                        <td>
                          {rec.checkInTime ? (
                            <span className="fw-semibold text-dark">{formatTime(rec.checkInTime)}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          {rec.checkOutTime ? (
                            <span className="fw-semibold text-dark">{formatTime(rec.checkOutTime)}</span>
                          ) : rec.checkInTime ? (
                            <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                              Currently Active
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          {rec.totalHours ? (
                            <span className="badge bg-light text-primary border font-monospace">
                              {rec.totalHours} hrs
                            </span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={rec.status} />
                        </td>
                        <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }} title={rec.notes}>
                          {rec.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-top bg-light d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </button>
              <span className="small text-muted font-monospace">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: DEPARTMENT VISUAL BREAKDOWN */}
      {activeViewTab === 'departments' && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="ss-card p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                    Department Shift Distribution & Attendance Capacity
                  </h2>
                  <p className="text-muted small mb-0">
                    Real-time presence breakdown by department for {targetDateStr}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3 small">
                  <span className="d-flex align-items-center gap-1">
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#10B981', borderRadius: '2px' }} />
                    <span>Present</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
                    <span>Late</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#3B82F6', borderRadius: '2px' }} />
                    <span>On Leave</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#EF4444', borderRadius: '2px' }} />
                    <span>Absent</span>
                  </span>
                </div>
              </div>

              {departmentAttendanceMetrics.length === 0 ? (
                <div className="py-5 text-center text-muted">
                  No departments found.
                </div>
              ) : (
                <div className="d-flex flex-column gap-4 pt-2">
                  {departmentAttendanceMetrics.map((item) => {
                    const dept = item.department;
                    const total = item.total;
                    const presentPct = total > 0 ? Math.round((item.present / total) * 100) : 0;
                    const latePct = total > 0 ? Math.round((item.late / total) * 100) : 0;
                    const leavePct = total > 0 ? Math.round((item.onLeave / total) * 100) : 0;
                    const absentPct = total > 0 ? Math.max(0, 100 - (presentPct + latePct + leavePct)) : 0;

                    return (
                      <div key={dept._id || dept.id} className="p-3 rounded-3 bg-light border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <strong className="text-dark fs-6">{dept.name}</strong>
                            <span className="badge bg-white text-secondary border font-monospace">
                              {dept.code}
                            </span>
                          </div>
                          <div className="small fw-semibold">
                            {total === 0 ? (
                              <span className="text-muted">No eligible staff assigned</span>
                            ) : (
                              <>
                                <span className="text-success">{item.present + item.late} Present</span>
                                <span className="text-muted mx-1.5">•</span>
                                <span className="text-primary">{item.onLeave} On Leave</span>
                                <span className="text-muted mx-1.5">•</span>
                                <span className="text-danger">{item.absent} Absent</span>
                                <span className="text-muted mx-1.5">/</span>
                                <span className="text-dark">{item.total} Total</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Visual Stacked Progress Bar */}
                        <div className="progress" style={{ height: '10px', borderRadius: '6px', backgroundColor: '#E2E8F0' }}>
                          {total > 0 ? (
                            <>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${presentPct}%`, backgroundColor: '#10B981' }}
                                title={`Present: ${item.present}`}
                              />
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${latePct}%`, backgroundColor: '#F59E0B' }}
                                title={`Late: ${item.late}`}
                              />
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${leavePct}%`, backgroundColor: '#3B82F6' }}
                                title={`On Leave: ${item.onLeave}`}
                              />
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${absentPct}%`, backgroundColor: '#EF4444' }}
                                title={`Absent: ${item.absent}`}
                              />
                            </>
                          ) : (
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: '100%', backgroundColor: '#CBD5E1', opacity: 0.5 }}
                              title="No staff allocated"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 3: ACTIVITY TIMELINE */}
      {activeViewTab === 'timeline' && (
        <div className="ss-card p-4 shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <div>
              <h2 className="h6 fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Real-Time Punch Activity Trail
              </h2>
              <p className="text-muted small mb-0">
                Chronological timeline of employee check-in and check-out events
              </p>
            </div>
            <span className="badge bg-light text-secondary border font-monospace">
              {chronologicalPunches.length} events logged
            </span>
          </div>

          {chronologicalPunches.length === 0 ? (
            <div className="py-5 text-center text-muted">
              Zero punch events recorded for this selection.
            </div>
          ) : (
            <div className="position-relative ps-4 py-2">
              {/* Vertical connector line */}
              <div
                className="position-absolute top-0 bottom-0 start-2"
                style={{ width: '2px', backgroundColor: '#E2E8F0', left: '16px' }}
              />

              <div className="d-flex flex-column gap-3">
                {chronologicalPunches.slice(0, 20).map((punch) => {
                  const emp = punch.employeeId || {};
                  const fullName = emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Staff Member';
                  const initials = emp.firstName ? `${emp.firstName[0]}${emp.lastName?.[0] || ''}` : 'U';
                  const hasCheckedOut = !!punch.checkOutTime;

                  return (
                    <div key={punch._id || punch.id} className="d-flex align-items-start gap-3 position-relative">
                      {/* Timeline dot / avatar */}
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: hasCheckedOut ? '#3B82F6' : '#10B981',
                          fontSize: '0.75rem',
                          zIndex: 2
                        }}
                      >
                        {initials}
                      </div>

                      <div className="p-3 rounded-3 bg-light border flex-grow-1">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
                          <div>
                            <strong className="text-dark">{fullName}</strong>
                            <span className="text-muted small ms-2">({emp.employeeCode || '—'})</span>
                          </div>
                          <span className="small text-muted font-monospace">
                            {formatDate(punch.date)}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2 small">
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20">
                            Check In: {formatTime(punch.checkInTime)}
                          </span>
                          {hasCheckedOut ? (
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20">
                              Check Out: {formatTime(punch.checkOutTime)} ({punch.totalHours} hrs)
                            </span>
                          ) : (
                            <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Currently On Floor
                            </span>
                          )}
                          <StatusBadge status={punch.status} />
                        </div>

                        {punch.notes && (
                          <div className="text-muted small mt-1.5 fst-italic">
                            "{punch.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Punch Modal */}
      {showManualModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl" style={{ borderRadius: '16px' }}>
              <form onSubmit={handleManualSubmit}>
                <div className="modal-header border-bottom py-3 px-4">
                  <h3 className="modal-title h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    <Icon name="clock" size={18} color="#4F46E5" />
                    <span>Log Manual Attendance Punch</span>
                  </h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowManualModal(false)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Employee <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={modalForm.employeeId}
                      onChange={(e) => setModalForm({ ...modalForm, employeeId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp._id || emp.id} value={emp._id || emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.departmentId?.name || 'Staff'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Shift Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={modalForm.date}
                        onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Check-In Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={modalForm.checkInTime}
                        onChange={(e) => setModalForm({ ...modalForm, checkInTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Check-Out Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={modalForm.checkOutTime}
                        onChange={(e) => setModalForm({ ...modalForm, checkOutTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Attendance Status</label>
                    <select
                      className="form-select"
                      value={modalForm.status}
                      onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late Arrival</option>
                      <option value="HALF_DAY">Half Day</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Audit Notes</label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalForm.notes}
                      onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                      placeholder="e.g. Regularized badge punch per manager confirmation"
                    />
                  </div>
                </div>
                <div className="modal-footer border-top py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowManualModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-accent btn-sm px-4"
                    disabled={modalSubmitting}
                  >
                    {modalSubmitting ? 'Recording...' : 'Save Punch Record'}
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

export default AdminAttendance;
