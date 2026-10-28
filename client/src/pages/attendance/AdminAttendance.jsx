import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import attendanceService from '../../api/attendanceService.js';
import departmentService from '../../api/departmentService.js';
import employeeService from '../../api/employeeService.js';

export const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Manual Punch Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalForm, setModalForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00',
    checkOutTime: '17:30',
    status: 'PRESENT',
    notes: 'HR administrative entry'
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 20
      };
      if (selectedDate) params.date = selectedDate;
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedStatus) params.status = selectedStatus;

      const res = await attendanceService.getAllAttendance(params);
      if (res && res.data) {
        setRecords(res.data);
        setTotalRecords(res.total || res.data.length);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch attendance logs.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedDate, selectedDept, selectedStatus]);

  useEffect(() => {
    // Load metadata once
    Promise.all([
      departmentService.getAll().catch(() => ({ data: [] })),
      employeeService.getAll().catch(() => ({ data: [] }))
    ]).then(([deptRes, empRes]) => {
      if (deptRes && deptRes.data) setDepartments(deptRes.data);
      if (empRes && empRes.data) setEmployees(empRes.data);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

      setSuccessMsg('Manual attendance record successfully created.');
      setShowManualModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create manual attendance record.');
    } finally {
      setModalSubmitting(false);
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

  // Aggregated metrics from records
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const halfDayCount = records.filter((r) => r.status === 'HALF_DAY').length;

  return (
    <div>
      <PageHeader
        title="Company Attendance Overview"
        subtitle="Organization-wide time-tracking compliance, departmental reports, and attendance records."
        breadcrumbs={[
          { label: 'Attendance', path: '/attendance' },
          { label: 'Company Overview', path: '/attendance/admin' }
        ]}
        actionButton={
          <button
            type="button"
            className="btn btn-sm btn-accent"
            onClick={() => setShowManualModal(true)}
          >
            ➕ Log Manual Punch
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Total Logs</span>
            <span className="fs-3 fw-bold text-primary">{totalRecords}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Present On Time</span>
            <span className="fs-3 fw-bold text-success">{presentCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Late Arrivals</span>
            <span className="fs-3 fw-bold text-warning">{lateCount}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center">
            <span className="small text-muted d-block">Half Days</span>
            <span className="fs-3 fw-bold text-info">{halfDayCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="ss-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label htmlFor="filterDate" className="form-label small text-muted mb-1">
              Date Filter
            </label>
            <input
              id="filterDate"
              type="date"
              className="form-control form-control-sm"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="filterDept" className="form-label small text-muted mb-1">
              Department
            </label>
            <select
              id="filterDept"
              className="form-select form-select-sm"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="filterStatus" className="form-label small text-muted mb-1">
              Punch Status
            </label>
            <select
              id="filterStatus"
              className="form-select form-select-sm"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Company Attendance Records
          </h2>
          <span className="badge bg-light text-dark border">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Loading company attendance records..." size="md" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <div className="fs-2 mb-2">📋</div>
            <p className="mb-0">No attendance records found matching the active filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Date</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const emp = r.employeeId || {};
                  const dept = emp.departmentId || {};
                  return (
                    <tr key={r._id}>
                      <td className="ps-3 fw-semibold">{formatDate(r.date)}</td>
                      <td>
                        <strong>{emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'System User'}</strong>
                        <div className="small text-muted font-monospace">{emp.employeeCode || '—'}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {dept.name || 'Unassigned'}
                        </span>
                      </td>
                      <td>{formatTime(r.checkInTime)}</td>
                      <td>{formatTime(r.checkOutTime)}</td>
                      <td>
                        <span className="font-monospace">
                          {r.totalHours ? `${r.totalHours}h` : r.checkOutTime ? '0.0h' : 'In Progress'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="text-muted small">{r.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-between align-items-center">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="small text-muted">
              Page {currentPage} of {totalPages} ({totalRecords} items)
            </span>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Manual Punch Modal */}
      {showManualModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleManualSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title h6 fw-bold">➕ Create Manual Attendance Punch</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowManualModal(false)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Employee *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={modalForm.employeeId}
                      onChange={(e) => setModalForm({ ...modalForm, employeeId: e.target.value })}
                    >
                      <option value="">Select Employee...</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.employeeCode} — {emp.firstName} {emp.lastName} ({emp.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Date *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={modalForm.date}
                      onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-In Time *</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        required
                        value={modalForm.checkInTime}
                        onChange={(e) => setModalForm({ ...modalForm, checkInTime: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-Out Time</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={modalForm.checkOutTime}
                        onChange={(e) => setModalForm({ ...modalForm, checkOutTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Status *</label>
                    <select
                      className="form-select form-select-sm"
                      value={modalForm.status}
                      onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="ABSENT">Absent</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Administrative Note</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={modalForm.notes}
                      onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                      placeholder="e.g. Backfilled record per timesheet approval"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowManualModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-accent"
                    disabled={modalSubmitting}
                  >
                    {modalSubmitting ? 'Saving...' : 'Save Record'}
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
