import React from 'react';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  icon = '📭',
  action = null
}) => {
  return (
    <div className="text-center py-5 px-3">
      <div
        className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
        style={{
          width: '72px',
          height: '72px',
          backgroundColor: 'var(--ss-color-surface-alt)',
          fontSize: '2rem'
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="h5 fw-bold mb-2" style={{ color: 'var(--ss-color-primary)' }}>
        {title}
      </h3>
      <p className="text-muted mx-auto mb-3" style={{ maxWidth: '420px', fontSize: '0.9rem' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

