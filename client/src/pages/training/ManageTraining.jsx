import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import Icon from '../../components/common/Icon.jsx';

export const ManageTraining = () => {
  return (
    <div>
      <PageHeader
        title="Manage Training Programs"
        subtitle="Schedule corporate training sessions, assign instructors, and review participant rosters."
        breadcrumbs={[
          { label: 'Training', path: '/training' },
          { label: 'Manage Sessions', path: '/training/manage' }
        ]}
        actionButton={
          <Link to="/training" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5">
            <Icon name="arrow-left" size={15} />
            <span>View Catalog</span>
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="Training Administration & Roster Management"
        targetPhase="Phase 10 (Announcements & Training Management)"
        description="Displays the approved workshop creation form and attendee roster view. MongoDB persistence connects in Phase 10."
      />

      <div className="ss-card p-4">
        <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
          Schedule New Workshop
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); alert('Session scheduling will be connected in Phase 10.'); }}>
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <label className="form-label small fw-semibold">Course Title <span className="text-danger">*</span></label>
              <input type="text" className="form-control" placeholder="e.g. Modern Web Security Practices" required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Participant Capacity <span className="text-danger">*</span></label>
              <input type="number" className="form-control" defaultValue={25} min={1} max={500} required />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Instructor / Trainer <span className="text-danger">*</span></label>
              <input type="text" className="form-control" placeholder="Instructor name or academy" required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Venue or Meeting URL <span className="text-danger">*</span></label>
              <input type="text" className="form-control" placeholder="Room 302 or virtual conference URL" required />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Start Date & Time <span className="text-danger">*</span></label>
              <input type="datetime-local" className="form-control" required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">End Date & Time <span className="text-danger">*</span></label>
              <input type="datetime-local" className="form-control" required />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Description & Syllabus <span className="text-danger">*</span></label>
            <textarea className="form-control" rows="3" placeholder="Overview of skills taught..." required />
          </div>

          <button type="submit" className="btn btn-accent btn-sm px-4">
            Schedule Program
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageTraining;
