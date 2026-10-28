import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import leaveService from '../../api/leaveService.js';

export const LeaveCenter = () => {
  const [requests, setRequests] = useState([]);
  const [balance, setBalance] = useState({
    annual: { quota: 15, used: 0 },
    casual: { quota: 10, used: 0 },
    sick: { quota: 10, used: 0 },
    unpaid: { used: 0 }
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await leaveService.getMyLeaves(params);
      if (res && res.data) {
        setRequests(res.data);
      }
      if (res && res.balance) {
        setBalance(res.balance);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load leave records.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await leaveService.cancel(id);
      setSuccessMsg('Leave application cancelled successfully.');
      await fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel leave request.');
    } finally {
      setActionLoading(false);
    }
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
        title="Leave Center & Quotas"
        subtitle="Track your remaining paid time off balances, review active applications, and browse leave history."
        breadcrumbs={[{ label: 'Leaves', path: '/leaves' }]}
        actionButton={
          <Link to="/leaves/apply" className="btn btn-accent btn-sm">
            ➕ Apply for Leave
          </Link>
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

      {/* Quota Balance Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-primary">
            <span className="small text-muted d-block fw-semibold text-uppercase">Annual Leave</span>
            <span className="fs-3 fw-bold text-primary">
              {(balance.annual?.quota || 15) - (balance.annual?.used || 0)}
            </span>
            <span className="small text-muted d-block">{balance.annual?.quota || 15} total allocated</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-success">
            <span className="small text-muted d-block fw-semibold text-uppercase">Casual Leave</span>
            <span className="fs-3 fw-bold text-success">
              {(balance.casual?.quota || 10) - (balance.casual?.used || 0)}
            </span>
            <span className="small text-muted d-block">{balance.casual?.quota || 10} total allocated</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-warning">
            <span className="small text-muted d-block fw-semibold text-uppercase">Sick Leave</span>
            <span className="fs-3 fw-bold text-warning">
              {(balance.sick?.quota || 10) - (balance.sick?.used || 0)}
            </span>
            <span className="small text-muted d-block">{balance.sick?.quota || 10} total allocated</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="ss-card p-3 text-center border-start border-4 border-secondary">
            <span className="small text-muted d-block fw-semibold text-uppercase">Unpaid Leave</span>
            <span className="fs-3 fw-bold text-secondary">{balance.unpaid?.used || 0}</span>
            <span className="small text-muted d-block">Days consumed</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="ss-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            My Leave Request History
          </h2>
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="leaveStatusFilter" className="small text-muted mb-0">Status:</label>
            <select
              id="leaveStatusFilter"
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Loading your leave applications..." size="md" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <div className="fs-2 mb-2">🏖️</div>
            <p className="mb-0">No leave applications found. Click "Apply for Leave" above to request time off.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Reviewed By</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td className="ps-3 fw-semibold">
                      <span className="badge bg-light text-dark border me-1">{req.leaveType}</span>
                    </td>
                    <td>
                      {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    </td>
                    <td>
                      <span className="font-monospace">{req.totalDays} day{req.totalDays > 1 ? 's' : ''}</span>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '220px' }} title={req.reason}>
                      {req.reason}
                    </td>
                    <td>
                      {req.reviewedBy ? (
                        <div>
                          <strong>{req.reviewedBy.name}</strong>
                          {req.reviewComment && (
                            <div className="small text-muted fst-italic" title={req.reviewComment}>
                              "{req.reviewComment}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted small">Pending Review</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="text-end pe-3">
                      {req.status === 'PENDING' && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm py-0 px-2"
                          onClick={() => handleCancel(req._id)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
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

export default LeaveCenter;
