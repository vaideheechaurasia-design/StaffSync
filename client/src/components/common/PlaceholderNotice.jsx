import React from 'react';
import Icon from './Icon.jsx';

export const PlaceholderNotice = ({
  featureName,
  targetPhase,
  description
}) => {
  return (
    <div
      className="alert d-flex align-items-start gap-3 p-3 mb-4"
      style={{
        backgroundColor: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '12px',
        color: '#0369A1'
      }}
      role="region"
      aria-label="Phase notice"
    >
      <div className="flex-shrink-0 pt-0.5">
        <Icon name="info" size={20} color="#0284C7" />
      </div>
      <div>
        <h4 className="h6 fw-bold mb-1 text-dark">
          {featureName} — Architectural Foundation
        </h4>
        <p className="mb-1 text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          {description || 'This route has been created and verified as part of the core frontend architecture. Full business logic, MongoDB persistence, and backend APIs connect in later phases.'}
        </p>
        <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.75rem' }}>
          Scheduled: {targetPhase}
        </span>
      </div>
    </div>
  );
};

export default PlaceholderNotice;
