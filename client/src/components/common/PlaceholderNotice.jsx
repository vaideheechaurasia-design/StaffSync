import React from 'react';

export const PlaceholderNotice = ({
  featureName,
  targetPhase,
  description
}) => {
  return (
    <div
      className="alert d-flex align-items-start gap-3 p-3 mb-4"
      style={{
        backgroundColor: '#E8F4F8',
        border: '1px solid #B8E2EC',
        borderRadius: 'var(--ss-radius-md)',
        color: '#1A535C'
      }}
      role="region"
      aria-label="Phase notice"
    >
      <div style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden="true">
        ℹ️
      </div>
      <div>
        <h4 className="h6 fw-bold mb-1">
          {featureName} — Frontend Foundation Placeholder
        </h4>
        <p className="mb-1" style={{ fontSize: '0.85rem' }}>
          {description || 'This route has been created and verified as part of Phase 4 (Frontend Foundation). Full business logic, MongoDB persistence, and backend APIs will be activated in later phases.'}
        </p>
        <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
          Scheduled Implementation: {targetPhase}
        </span>
      </div>
    </div>
  );
};

export default PlaceholderNotice;

