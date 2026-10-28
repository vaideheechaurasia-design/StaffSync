import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';

export const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Leave Application Received', message: 'Your leave request for Nov 10 – Nov 12 was received and routed to Marcus Brody.', time: '2 hours ago', unread: true, type: 'LEAVE' },
    { id: 2, title: 'New Company Bulletin Posted', message: 'Annual Company Retreat 2026 has been published by People Ops.', time: '1 day ago', unread: true, type: 'ANNOUNCEMENT' },
    { id: 3, title: 'Training Registration Confirmed', message: 'You have enrolled in Advanced React Patterns & Performance.', time: '3 days ago', unread: true, type: 'TRAINING' },
    { id: 4, title: 'Attendance Regularization Note', message: 'Your check-in on Oct 24 was logged at 09:10 AM.', time: '4 days ago', unread: false, type: 'ATTENDANCE' }
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div>
      <PageHeader
        title="Notifications Center"
        subtitle="Review in-app operational updates, leave approval decisions, and corporate announcements."
        breadcrumbs={[{ label: 'Notifications', path: '/notifications' }]}
        actionButton={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleMarkAllRead}>
            ✓ Mark All as Read
          </button>
        }
      />

      <PlaceholderNotice
        featureName="In-App Notification Dispatch"
        targetPhase="Phase 11 (Dashboards, Notifications & Analytics)"
        description="Displays approved notification card list with unread markers. Real-time bell polling and 60-day auto-expiry connect in Phase 11."
      />

      <div className="ss-card p-0 overflow-hidden">
        <div className="list-group list-group-flush">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`list-group-item p-3 d-flex align-items-start gap-3 ${
                notif.unread ? 'bg-light' : ''
              }`}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: notif.unread ? 'var(--ss-color-accent)' : 'var(--ss-color-secondary)'
                }}
              >
                {notif.type === 'LEAVE' ? '📅' : notif.type === 'TRAINING' ? '🎓' : '📢'}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h2 className="h6 mb-0 fw-bold">{notif.title}</h2>
                  <span className="small text-muted">{notif.time}</span>
                </div>
                <p className="text-muted small mb-0">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;

