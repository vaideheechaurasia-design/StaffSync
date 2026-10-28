import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProfileSettings = () => {
  const { currentUser } = useAuth();
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [emergencyName, setEmergencyName] = useState('Robert Doe');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 987-6543');

  return (
    <div>
      <PageHeader
        title="Profile & Account Settings"
        subtitle="Manage personal contact details, review reporting hierarchy, and update security credentials."
        breadcrumbs={[{ label: 'Profile Settings', path: '/profile' }]}
      />

      <PlaceholderNotice
        featureName="Self-Service Contact Updates & Password Change"
        targetPhase="Phase 6 (Auth) & Phase 7 (Employee Profile)"
        description="Displays approved profile form layout. Bcrypt password validation and database profile updates connect in Phase 6 and 7."
      />

      <div className="row g-4">
        {/* Personal Details Column */}
        <div className="col-lg-7">
          <div className="ss-card p-4">
            <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
              Personal Information
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Profile updates will be connected in Phase 7.'); }}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Employee Code</label>
                  <input type="text" className="form-control font-monospace" value={currentUser?.employeeCode || 'EMP-1003'} readOnly disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Work Email</label>
                  <input type="email" className="form-control" value={currentUser?.email || 'employee@staffsync.internal'} readOnly disabled />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <h3 className="h6 fw-bold mt-4 mb-2">Primary Emergency Contact (Approved Specification)</h3>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Contact Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Emergency Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                Save Contact Updates
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Column */}
        <div className="col-lg-5">
          <div className="ss-card p-4">
            <h2 className="h6 fw-bold mb-3 text-uppercase text-muted border-bottom pb-2">
              Change Password
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Password change endpoint will be enabled in Phase 6.'); }}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Current Password</label>
                <input type="password" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">New Password</label>
                <input type="password" className="form-control" minLength={8} required />
                <div className="form-text small">Minimum 8 characters (Approved policy)</div>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold">Confirm New Password</label>
                <input type="password" className="form-control" minLength={8} required />
              </div>
              <button type="submit" className="btn btn-outline-danger btn-sm w-100">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

