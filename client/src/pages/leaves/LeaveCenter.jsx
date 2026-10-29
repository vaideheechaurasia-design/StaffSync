import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import Icon from '../../components/common/Icon.jsx';
import leaveService from '../../api/leaveService.js';
import { exportToCSV } from '../../utils/csvExport.js';

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

  const handleExportCSV = () => {
    const columns = [
      { key: 'leaveType', label: 'Leave Type' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'totalDays', label: 'Duration (Days)' },
      { key: 'status', label: 'Status' },
      { key: 'reason', label: 'Reason' },
      { key: 'reviewComment', label: 'Manager Feedback' }
    ];
    exportToCSV(`staffsync-my-leaves-${new Date().toISOString().split('T')[0]}.csv`, requests, columns);
  };

  return (
    <div>
      <PageHeader
        title="Leave Center & Quotas"
        subtitle="Track your remaining paid time off balances, review active applications, and browse leave history."
        breadcrumbs={[{ label: 'Leaves', path: '/leaves' }]}
        actionButton={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
              onClick={handleExportCSV}
              disabled={requests.length === 0}
              title="Download leave records as CSV"
            >
              <Icon name="download" size={14} />
              <span>Export CSV</span>
            </button>
            <Link to="/leaves/apply" className="btn btn-accent btn-sm shadow-sm d-flex align-items-center gap-1.5">
              <Icon name="plus" size={16} />
              <span>Apply for Leave</span>
            </Link>
          </div>
        }
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
          <button type="button" className="btn-close ms-auto" onClick={() => setSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Quota Balance Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Annual Leave"
            value={String((balance.annual?.quota || 15) - (balance.annual?.used || 0))}
            icon="calendar"
            variant="indigo"
            changeText={`of ${balance.annual?.quota || 15} days quota`}
          />
        </div>
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Casual Leave"
            value={String((balance.casual?.quota || 10) - (balance.casual?.used || 0))}
            icon="clock"
            variant="emerald"
            changeText={`of ${balance.casual?.quota || 10} days quota`}
          />
        </div>
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Sick Leave"
            value={String((balance.sick?.quota || 10) - (balance.sick?.used || 0))}
            icon="check-circle"
            variant="amber"
            changeText={`of ${balance.sick?.quota || 10} days quota`}
          />
        </div>
        <div className="col-6 col-md-3">
          <SummaryCard
            label="Unpaid Leave"
            value={String(balance.unpaid?.used || 0)}
            icon="calendar"
            variant="blue"
            changeText="Days consumed"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="ss-card p-0 overflow-hidden shadow-sm">
        <div className="p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 bg-light">
          <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
            My Leave Request History
          </h2>
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="leaveStatusFilter" className="small text-muted mb-0 fw-semibold">Status:</label>
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
            <EmptyState
              icon="calendar"
              title="No Leave Applications Found"
              description="No leave applications match your filter. Click 'Apply for Leave' to submit your first request."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Reviewed By</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td className="ps-4 fw-semibold">
                      <span className="badge bg-light text-primary border font-monospace me-1">
                        {req.leaveType}
                      </span>
                    </td>
                    <td className="text-dark fw-medium">
                      {formatDate(req.startDate)} → {formatDate(req.endDate)}
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border font-monospace">
                        {req.totalDays} day{req.totalDays > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '220px' }} title={req.reason}>
                      {req.reason}
                    </td>
                    <td>
                      {req.reviewedBy ? (
                        <div>
                          <strong className="text-dark">{req.reviewedBy.name}</strong>
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
                    <td className="text-end pe-4">
                      {req.status === 'PENDING' && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm py-1 px-2.5"
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
