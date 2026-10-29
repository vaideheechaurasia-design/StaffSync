import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import leaveService from '../../api/leaveService.js';

export const ApplyLeave = () => {
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [balance, setBalance] = useState({
    annual: { quota: 15, used: 0 },
    casual: { quota: 10, used: 0 },
    sick: { quota: 10, used: 0 },
    unpaid: { used: 0 }
  });

  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    leaveService.getMyBalance()
      .then((res) => {
        if (res && res.data) {
          setBalance(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load leave quotas:', err);
      })
      .finally(() => {
        setIsLoadingBalance(false);
      });
  }, []);

  // Compute business days
  const computeDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;

    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getUTCDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return Math.max(1, count);
  };

  const calculatedDays = computeDays();

  const annualRemaining = (balance.annual?.quota || 15) - (balance.annual?.used || 0);
  const casualRemaining = (balance.casual?.quota || 10) - (balance.casual?.used || 0);
  const sickRemaining = (balance.sick?.quota || 10) - (balance.sick?.used || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (calculatedDays <= 0) {
      setError('End date must be greater than or equal to start date.');
      return;
    }

    // Quota validation
    if (leaveType === 'ANNUAL' && calculatedDays > annualRemaining) {
      setError(`Insufficient Annual Leave balance. You requested ${calculatedDays} day(s), but only have ${annualRemaining} remaining.`);
      return;
    }
    if (leaveType === 'CASUAL' && calculatedDays > casualRemaining) {
      setError(`Insufficient Casual Leave balance. You requested ${calculatedDays} day(s), but only have ${casualRemaining} remaining.`);
      return;
    }
    if (leaveType === 'SICK' && calculatedDays > sickRemaining) {
      setError(`Insufficient Sick Leave balance. You requested ${calculatedDays} day(s), but only have ${sickRemaining} remaining.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await leaveService.apply({
        leaveType,
        startDate,
        endDate,
        totalDays: calculatedDays,
        reason: reason.trim()
      });

      setSuccessMsg('Leave application submitted successfully! Redirecting to Leave Center...');
      setTimeout(() => {
        navigate('/leaves');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit a formal time-off application for review and approval by your supervisor."
        breadcrumbs={[
          { label: 'Leaves', path: '/leaves' },
          { label: 'Apply', path: '/leaves/apply' }
        ]}
      />

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
        </div>
      )}

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-8">
          <div className="ss-card p-4 p-md-5 shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="leaveTypeSelect" className="form-label">
                  Leave Type <span className="text-danger">*</span>
                </label>
                <select
                  id="leaveTypeSelect"
                  className="form-select"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                >
                  <option value="ANNUAL">Annual Leave ({annualRemaining} days remaining)</option>
                  <option value="CASUAL">Casual Leave ({casualRemaining} days remaining)</option>
                  <option value="SICK">Sick Leave ({sickRemaining} days remaining)</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="startDateInput" className="form-label">
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <input
                    id="startDateInput"
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="endDateInput" className="form-label">
                    End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    id="endDateInput"
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {calculatedDays > 0 && (
                <div className="p-3 bg-light rounded-3 mb-4 d-flex justify-content-between align-items-center border">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="calendar-check" size={18} color="#4F46E5" />
                    <span className="small text-muted fw-medium">Computed Business Days:</span>
                  </div>
                  <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200 fs-6 font-monospace" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                    {calculatedDays} working {calculatedDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="reasonTextarea" className="form-label">
                  Reason for Absence <span className="text-danger">*</span>
                </label>
                <textarea
                  id="reasonTextarea"
                  className="form-control"
                  rows="4"
                  placeholder="Provide context for your manager (5–500 characters)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minLength={5}
                  maxLength={500}
                  required
                />
                <div className="form-text small mt-1">{reason.length} / 500 characters</div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <Link to="/leaves" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-accent px-4 shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quota Sidebar */}
        <div className="col-lg-4">
          <div className="ss-card p-4 shadow-sm">
            <h2 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Your {new Date().getFullYear()} Quota Status
            </h2>
            {isLoadingBalance ? (
              <LoadingSpinner label="Loading quotas..." size="sm" />
            ) : (
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="p-2.5 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-semibold">Annual Leave:</span>
                  <span className="badge bg-indigo-50 text-indigo-700 border font-monospace" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                    {annualRemaining} / {balance.annual?.quota || 15} days
                  </span>
                </div>
                <div className="p-2.5 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-semibold">Casual Leave:</span>
                  <span className="badge bg-amber-50 text-amber-700 border font-monospace" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                    {casualRemaining} / {balance.casual?.quota || 10} days
                  </span>
                </div>
                <div className="p-2.5 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-semibold">Sick Leave:</span>
                  <span className="badge bg-emerald-50 text-emerald-700 border font-monospace" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                    {sickRemaining} / {balance.sick?.quota || 10} days
                  </span>
                </div>
                <div className="p-2.5 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-semibold">Unpaid Leave:</span>
                  <span className="badge bg-slate-50 text-secondary border font-monospace">
                    {balance.unpaid?.used || 0} days consumed
                  </span>
                </div>
              </div>
            )}
            <div className="p-3 bg-light rounded-3 text-muted small border d-flex gap-2">
              <Icon name="info" size={16} color="#64748B" className="flex-shrink-0 mt-0.5" />
              <span>Standard working days (Mon–Fri) are calculated automatically. Weekend days are excluded from quota deductions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
