import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export const EmployeeProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <PageHeader
        title="Employee Profile Details"
        subtitle="Individual personnel record, emergency contacts, and organizational parameters."
        breadcrumbs={[
          { label: 'Employees', path: '/employees' },
          { label: 'Profile Details', path: `/employees/${id || 'view'}` }
        ]}
        actionButton={
          <Link to="/employees" className="btn btn-outline-secondary btn-sm">
            ← Back to Directory
          </Link>
        }
      />

      <PlaceholderNotice
        featureName="Employee Profile & Soft-Deactivation"
        targetPhase="Phase 7 (Employee Management)"
        description="Displays profile layout and emergency contact structures. Backend profile updates and deactivation hooks will be wired up in Phase 7."
      />

      {/* Main Profile Header Card */}
      <div className="ss-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3"
            style={{ width: '72px', height: '72px', backgroundColor: 'var(--ss-color-primary)' }}
          >
            JD
          </div>
          <div className="flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h2 className="h4 mb-0 fw-bold" style={{ color: 'var(--ss-color-primary)' }}>
                Jane Doe
              </h2>
              <span className="badge bg-light text-dark border font-monospace">EMP-1003</span>
              <StatusBadge status="ACTIVE" />
            </div>
            <p className="text-muted mb-0">
              Software Engineer • Engineering Department • Reports to <strong>Marcus Brody</strong>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mt-4 border-bottom" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active fw-bold' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview & Job
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'contact' ? 'active fw-bold' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              Contact & Emergency Contact
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="pt-4">
          {activeTab === 'overview' ? (
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <span className="small text-muted d-block">Work Email</span>
                  <strong>employee@staffsync.internal</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <span className="small text-muted d-block">Employment Type</span>
                  <strong>Full Time (Permanent)</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <span className="small text-muted d-block">Date of Joining</span>
                  <strong>January 15, 2024</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <span className="small text-muted d-block">Reporting Line</span>
                  <strong>Marcus Brody (Engineering Lead)</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <span className="small text-muted d-block">Phone Number</span>
                  <strong>+1 (555) 019-2834</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <span className="small text-muted d-block">Work Location</span>
                  <strong>HQ — Campus Alpha, Room 402</strong>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3 bg-light rounded border">
                  <h3 className="h6 fw-bold mb-2">Primary Emergency Contact (Approved Specification)</h3>
                  <div className="row g-2 small">
                    <div className="col-sm-4"><strong>Name:</strong> Robert Doe</div>
                    <div className="col-sm-4"><strong>Relationship:</strong> Spouse</div>
                    <div className="col-sm-4"><strong>Emergency Phone:</strong> +1 (555) 987-6543</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;

