import React from 'react';
import Icon from './Icon.jsx';

export const PlaceholderNotice = ({
  featureName,
  badgeText = 'Feature Preview',
  description
}) => {
  return (
    <div
      className="alert d-flex align-items-start gap-3 p-3 mb-4"
      style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        color: '#334155'
      }}
      role="region"
      aria-label="Feature notice"
    >
      <div className="flex-shrink-0 pt-0.5">
        <Icon name="info" size={20} color="#4F46E5" />
      </div>
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <h4 className="h6 fw-bold mb-0 text-dark">
            {featureName}
          </h4>
          <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200" style={{ fontSize: '0.6875rem', backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            {badgeText}
          </span>
        </div>
        <p className="mb-0 text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          {description || 'This module layout is active in preview mode. Automated publishing and management tools will be enabled in the upcoming platform update.'}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderNotice;
