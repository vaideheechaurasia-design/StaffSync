import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import Icon from '../../components/common/Icon.jsx';

export const ManageAnnouncements = () => {
  return (
    <div>
      <PageHeader
        title="Manage Announcements"
        subtitle="Author, pin, and archive company-wide bulletins and emergency alerts."
        breadcrumbs={[
          { label: 'Announcements', path: '/announcements' },
          { label: 'Manage', path: '/announcements/manage' }
        ]}
        actionButton={
          <Link to="/announcements" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5">
            <Icon name="arrow-left" size={15} />
            <span>View Feed</span>
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="Announcement Authoring & Archival"
        targetPhase="Phase 10 (Announcements & Training Management)"
        description="Displays the approved bulletin authoring form and management list. Publishing to MongoDB will be activated in Phase 10."
      />

      <div className="ss-card p-4">
        <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
          Create New Announcement
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); alert('Publishing will be enabled in Phase 10.'); }}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Title <span className="text-danger">*</span></label>
            <input type="text" className="form-control" placeholder="e.g. Q4 Townhall Meeting Schedule" required />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Priority Level <span className="text-danger">*</span></label>
              <select className="form-select" defaultValue="NORMAL">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Red Banner)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Category <span className="text-danger">*</span></label>
              <select className="form-select" defaultValue="GENERAL">
                <option value="GENERAL">General</option>
                <option value="POLICY">Policy</option>
                <option value="EVENT">Event</option>
                <option value="ALERT">Alert</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Content <span className="text-danger">*</span></label>
            <textarea className="form-control" rows="4" placeholder="Write bulletin content..." required />
          </div>

          <div className="form-check mb-4">
            <input className="form-check-input" type="checkbox" id="pinCheck" />
            <label className="form-check-label small" htmlFor="pinCheck">
              Pin to top of employee dashboard feed
            </label>
          </div>

          <button type="submit" className="btn btn-accent btn-sm px-4">
            Publish Announcement
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageAnnouncements;
