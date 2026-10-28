import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const AnnouncementFeed = () => {
  const { role } = useAuth();

  const BULLETINS = [
    { id: 'ann-1', title: 'Annual Company Retreat 2026', priority: 'URGENT', category: 'EVENT', date: '2 days ago', author: 'Eleanor Vance (HR)', content: 'We are thrilled to announce our 2026 Company Retreat! This year we will gather for collaborative workshops, hackathons, and team bonding. Please complete your registration and travel preferences by next Friday.', pinned: true },
    { id: 'ann-2', title: 'Q4 Health & Wellness Benefits Open Enrollment', priority: 'NORMAL', category: 'POLICY', date: '5 days ago', author: 'People Operations', content: 'The open enrollment period for optional health, dental, and wellness stipends is officially open. Please visit the benefits tab in your profile or consult the HR handbook for tier details.', pinned: false },
    { id: 'ann-3', title: 'IT Systems Maintenance Window (This Saturday)', priority: 'HIGH', category: 'ALERT', date: '1 week ago', author: 'Infrastructure Team', content: 'Our internal cloud services will undergo scheduled security updates this Saturday from 02:00 AM to 04:00 AM UTC. Single Sign-On and VPN services will experience intermittent pauses.', pinned: false }
  ];

  return (
    <div>
      <PageHeader
        title="Company Announcements"
        subtitle="Official organizational news, policy updates, and corporate event notices."
        breadcrumbs={[{ label: 'Announcements', path: '/announcements' }]}
        actionButton={
          role === 'HR_ADMIN' ? (
            <Link to="/announcements/manage" className="btn btn-accent btn-sm">
              ➕ Post Announcement
            </Link>
          ) : null
        }
      />

      <PlaceholderNotice
        featureName="Announcements & Bulletins Feed"
        targetPhase="Phase 10 (Announcements & Training Management)"
        description="Displays approved announcement layout with priority tags. Backend publishing, pinning, and TTL auto-archival will connect in Phase 10."
      />

      <div className="d-flex flex-column gap-3">
        {BULLETINS.map((b) => (
          <article
            key={b.id}
            className={`ss-card p-4 ${b.pinned ? 'border-primary border-2' : ''}`}
            aria-label={`Announcement: ${b.title}`}
          >
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                {b.pinned && <span className="badge bg-primary">📌 PINNED</span>}
                <span className={`badge ${b.priority === 'URGENT' ? 'bg-danger' : b.priority === 'HIGH' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                  {b.priority}
                </span>
                <span className="badge bg-light text-dark border">{b.category}</span>
              </div>
              <span className="small text-muted">{b.date} • By {b.author}</span>
            </div>
            <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--ss-color-primary)' }}>
              {b.title}
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.925rem', lineHeight: '1.6' }}>
              {b.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementFeed;

