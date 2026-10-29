import React from 'react';
import Icon from './Icon.jsx';

export const EmptyState = ({
  title = 'No records found',
  message = null,
  description = 'There are no items to display at this moment.',
  icon = 'inbox',
  action = null
}) => {
  const displayDesc = message || description;

  return (
    <div className="text-center py-5 px-3">
      <div
        className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#F1F5F9',
          color: '#64748B'
        }}
        aria-hidden="true"
      >
        {typeof icon === 'string' && icon.length > 2 ? (
          <Icon name={icon} size={28} color="#64748B" strokeWidth={1.75} />
        ) : (
          <span style={{ fontSize: '1.75rem' }}>{icon}</span>
        )}
      </div>
      <h3 className="h5 fw-bold mb-2" style={{ color: 'var(--ss-color-primary)', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px', fontSize: '0.875rem' }}>
        {displayDesc}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
