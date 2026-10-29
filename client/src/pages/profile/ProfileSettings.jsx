import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Icon from '../../components/common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProfileSettings = () => {
  const { currentUser } = useAuth();
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (555) 019-2834');
  const [emergencyName, setEmergencyName] = useState(currentUser?.emergencyContact?.name || 'Robert Doe');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergencyContact?.phone || '+1 (555) 987-6543');
  const [saveMessage, setSaveMessage] = useState(null);

  const handleSaveContact = (e) => {
    e.preventDefault();
    setSaveMessage('Profile contact details saved successfully.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Profile & Account Settings"
        subtitle="Manage personal contact details, review reporting hierarchy, and update security credentials."
        breadcrumbs={[{ label: 'Profile Settings', path: '/profile' }]}
      />

      {saveMessage && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check-circle" size={18} />
          <div>{saveMessage}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSaveMessage(null)} aria-label="Close" />
        </div>
      )}

      {/* Account Overview Header */}
      <div className="ss-card p-4 mb-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{ width: '60px', height: '60px', backgroundColor: '#1E293B', fontSize: '1.25rem' }}
          >
            {currentUser?.initials || 'U'}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="h5 fw-bold text-dark mb-0">
                {currentUser?.name || 'User Profile'}
              </h2>
              <span className="badge bg-indigo-50 text-indigo-700 border" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                {currentUser?.role || 'Staff'}
              </span>
            </div>
            <p className="text-muted small mb-0">
              Work Email: <strong className="text-dark">{currentUser?.email}</strong> • Session: <strong className="text-success">Active & Verified</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Personal Details Column */}
        <div className="col-lg-7">
          <div className="ss-card p-4 shadow-sm h-100">
            <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
              <Icon name="user" size={18} color="#4F46E5" />
              <h2 className="h6 fw-bold mb-0 text-uppercase text-dark">
                Personal Information
              </h2>
            </div>

            <form onSubmit={handleSaveContact}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Employee Code</label>
                  <input
                    type="text"
                    className="form-control font-monospace bg-light"
                    value={currentUser?.employeeCode || 'EMP-1001'}
                    readOnly
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={currentUser?.email || 'user@staffsync.internal'}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
                <Icon name="phone" size={18} color="#4F46E5" />
                <h3 className="h6 fw-bold mb-0 text-uppercase text-dark">
                  Primary Emergency Contact
                </h3>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Contact Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Emergency Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-accent px-4 shadow-sm">
                Save Contact Updates
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Column */}
        <div className="col-lg-5">
          <div className="ss-card p-4 shadow-sm h-100">
            <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
              <Icon name="lock" size={18} color="#4F46E5" />
              <h2 className="h6 fw-bold mb-0 text-uppercase text-dark">
                Security & Password
              </h2>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Security credentials updated.'); }}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" placeholder="••••••••••••" required />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" minLength={8} placeholder="Min 8 characters" required />
                <div className="form-text small">Must contain minimum 8 characters.</div>
              </div>
              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" minLength={8} placeholder="Repeat new password" required />
              </div>
              <button type="submit" className="btn btn-outline-danger w-100">
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
