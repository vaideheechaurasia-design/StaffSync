import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!startDate || !endDate) {
      setError('Please select both start date and end date.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (!reason || reason.trim().length < 5) {
      setError('Please provide a reason of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await leaveService.apply({
        leaveType,
        startDate,
        endDate,
        totalDays: calculatedDays,
        reason: reason.trim()
      });

      setSuccessMsg(res.message || 'Leave application submitted successfully!');
      setTimeout(() => {
        navigate('/leaves');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const annualRemaining = (balance.annual?.quota || 15) - (balance.annual?.used || 0);
  const casualRemaining = (balance.casual?.quota || 10) - (balance.casual?.used || 0);
  const sickRemaining = (balance.sick?.quota || 10) - (balance.sick?.used || 0);

  return (
    <div>
      <PageHeader
        title="Submit Leave Application"
        subtitle="Apply for time off. Requests are routed to your direct reporting manager for review."
        breadcrumbs={[
          { label: 'Leaves', path: '/leaves' },
          { label: 'Apply for Leave', path: '/leaves/apply' }
        ]}
        actionButton={
          <Link to="/leaves" className="btn btn-outline-secondary btn-sm">
            Cancel
          </Link>
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
        </div>
      )}

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-8">
          <div className="ss-card p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="leaveTypeSelect" className="form-label small fw-semibold">
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

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="startDateInput" className="form-label small fw-semibold">
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
                  <label htmlFor="endDateInput" className="form-label small fw-semibold">
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
                <div className="p-3 bg-light rounded mb-3 d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Requested Duration:</span>
                  <span className="badge bg-primary fs-6 font-monospace">
                    {calculatedDays} working day{calculatedDays > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="reasonTextarea" className="form-label small fw-semibold">
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
                <div className="form-text small">{reason.length} / 500 characters</div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Link to="/leaves" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-accent px-4"
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
          <div className="ss-card p-4">
            <h2 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Your {new Date().getFullYear()} Leave Quotas
            </h2>
            {isLoadingBalance ? (
              <LoadingSpinner label="Loading quotas..." size="sm" />
            ) : (
              <ul className="list-group list-group-flush small mb-3">
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span>Annual Leave:</span>
                  <strong>{annualRemaining} / {balance.annual?.quota || 15} days</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span>Casual Leave:</span>
                  <strong>{casualRemaining} / {balance.casual?.quota || 10} days</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span>Sick Leave:</span>
                  <strong>{sickRemaining} / {balance.sick?.quota || 10} days</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span>Unpaid Leave:</span>
                  <strong>{balance.unpaid?.used || 0} days consumed</strong>
                </li>
              </ul>
            )}
            <div className="p-2 bg-light rounded text-muted small">
              ℹ️ Standard working days (Mon–Fri) are counted automatically. Weekend days are excluded from quota deductions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
