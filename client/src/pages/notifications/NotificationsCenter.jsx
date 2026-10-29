import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Icon from '../../components/common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import leaveService from '../../api/leaveService.js';
import attendanceService from '../../api/attendanceService.js';

export const NotificationsCenter = () => {
  const { currentUser, role } = useAuth();
  const userId = currentUser?._id || currentUser?.id || 'default_user';
  const storageKey = `staffsync_read_notifs_${userId}`;

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchRealNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const notifList = [];

      // 1. Pending Leaves (For Managers and HR Admins)
      if (role === 'HR_ADMIN' || role === 'MANAGER') {
        try {
          const pendingRes = await leaveService.getPendingApprovals();
          if (pendingRes?.data && Array.isArray(pendingRes.data)) {
            pendingRes.data.forEach((req) => {
              const empName = req.employeeId ? `${req.employeeId.firstName} ${req.employeeId.lastName}` : 'An employee';
              notifList.push({
                id: `leave-pending-${req._id}`,
                title: 'Leave Approval Required',
                message: `${empName} applied for ${req.totalDays} days of ${req.leaveType} (${new Date(req.startDate).toLocaleDateString()} to ${new Date(req.endDate).toLocaleDateString()}). Reason: "${req.reason}"`,
                time: new Date(req.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(req.createdAt || Date.now()).getTime(),
                type: 'LEAVE_ACTION',
                link: '/leaves/approvals'
              });
            });
          }
        } catch (_) {}
      }

      // 2. Personal Leave Status Updates (For the current user)
      try {
        const myLeavesRes = await leaveService.getMyLeaves({ limit: 5 });
        if (myLeavesRes?.data && Array.isArray(myLeavesRes.data)) {
          myLeavesRes.data.forEach((req) => {
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';
            const isPending = req.status === 'PENDING';

            notifList.push({
              id: `my-leave-${req._id}`,
              title: isApproved ? 'Leave Request Approved' : isRejected ? 'Leave Request Rejected' : 'Leave Request Submitted',
              message: `Your ${req.totalDays}-day ${req.leaveType} application from ${new Date(req.startDate).toLocaleDateString()} is ${req.status.toLowerCase()}.${req.reviewComment ? ` Reviewer note: "${req.reviewComment}"` : ''}`,
              time: new Date(req.updatedAt || req.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' }),
              timestamp: new Date(req.updatedAt || req.createdAt || Date.now()).getTime(),
              type: isApproved ? 'SUCCESS' : isRejected ? 'ALERT' : 'INFO',
              link: '/leaves'
            });
          });
        }
      } catch (_) {}

      // 3. Today's Shift Punch Activity
      try {
        const todayStatusRes = await attendanceService.getTodayStatus();
        if (todayStatusRes?.data?.isCheckedIn) {
          const rec = todayStatusRes.data.record;
          const checkInFormatted = rec?.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recorded';
          notifList.push({
            id: `today-punch-${rec?._id || 'today'}`,
            title: todayStatusRes.data.isCheckedOut ? 'Shift Completed for Today' : 'Shift Active: Clocked In',
            message: todayStatusRes.data.isCheckedOut
              ? `You clocked out. Total working duration logged: ${rec?.totalHours || 0} hours.`
              : `Your daily check-in was registered at ${checkInFormatted}. Shift status: ${rec?.status || 'PRESENT'}.`,
            time: 'Today',
            timestamp: rec?.checkInTime ? new Date(rec.checkInTime).getTime() : Date.now(),
            type: 'ATTENDANCE',
            link: '/attendance'
          });
        }
      } catch (_) {}

      // 4. Sort chronologically
      notifList.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(notifList);
    } catch (err) {
      console.error('Error fetching real notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchRealNotifications();
  }, [fetchRealNotifications]);

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(allIds));
      window.dispatchEvent(new Event('staffsync_notifications_updated'));
    } catch (_) {}
  };

  const handleToggleRead = (id) => {
    let updated;
    if (readIds.includes(id)) {
      updated = readIds.filter((item) => item !== id);
    } else {
      updated = [...readIds, id];
    }
    setReadIds(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('staffsync_notifications_updated'));
    } catch (_) {}
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const getIconForType = (type) => {
    switch (type) {
      case 'LEAVE_ACTION':
        return 'inbox';
      case 'ATTENDANCE':
        return 'clock';
      case 'SUCCESS':
        return 'check-circle';
      case 'ALERT':
        return 'alert-circle';
      default:
        return 'bell';
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'LEAVE_ACTION':
        return '#D97706';
      case 'ATTENDANCE':
        return '#059669';
      case 'SUCCESS':
        return '#10B981';
      case 'ALERT':
        return '#DC2626';
      default:
        return '#4F46E5';
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications Center"
        subtitle="Live organizational updates, pending approvals, shift alerts, and leave decisions."
        breadcrumbs={[{ label: 'Notifications', path: '/notifications' }]}
        badge={unreadCount > 0 ? `${unreadCount} Unread` : 'All Read'}
        actionButton={
          unreadCount > 0 ? (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
              onClick={handleMarkAllRead}
            >
              <Icon name="check" size={14} />
              <span>Mark All as Read</span>
            </button>
          ) : null
        }
      />

      <div className="ss-card p-0 overflow-hidden shadow-sm">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <div className="d-flex align-items-center gap-2">
            <h2 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Operational Activity Feed
            </h2>
            <span className="badge bg-light text-secondary border font-monospace">
              {notifications.length} Events
            </span>
          </div>
          <span className="small text-muted">
            Aggregated from live MongoDB Atlas records
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 text-center">
            <LoadingSpinner label="Compiling real-time activity events..." size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <EmptyState
              icon="bell"
              title="No Notifications"
              description="Zero pending approvals or new activity logs recorded for your profile."
            />
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((notif) => {
              const isUnread = !readIds.includes(notif.id);

              return (
                <div
                  key={notif.id}
                  className={`list-group-item p-3.5 d-flex align-items-start gap-3 transition ${
                    isUnread ? 'bg-light' : 'bg-white'
                  }`}
                  style={isUnread ? { borderLeft: `3px solid ${getColorForType(notif.type)}` } : {}}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-xs"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: getColorForType(notif.type)
                    }}
                  >
                    <Icon name={getIconForType(notif.type)} size={18} color="#FFFFFF" />
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <h3 className="h6 mb-0 fw-bold text-dark">{notif.title}</h3>
                        {isUnread && (
                          <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.625rem' }}>
                            New
                          </span>
                        )}
                      </div>
                      <span className="small text-muted font-monospace">{notif.time}</span>
                    </div>

                    <p className="text-muted small mb-2" style={{ lineHeight: '1.5' }}>
                      {notif.message}
                    </p>

                    <div className="d-flex align-items-center gap-3">
                      {notif.link && (
                        <a
                          href={notif.link}
                          className="small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1"
                        >
                          <span>Review Workflow</span>
                          <Icon name="arrow-right" size={13} />
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-muted small text-decoration-none"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleToggleRead(notif.id)}
                      >
                        {isUnread ? 'Mark read' : 'Mark unread'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsCenter;
