import React from 'react';

export const LoadingSpinner = ({ label = 'Loading data...', size = 'md' }) => {
  const spinnerSize = size === 'sm' ? '1rem' : '2.5rem';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-4" role="status">
      <div
        className="spinner-border text-primary"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderColor: 'var(--ss-color-accent)',
          borderRightColor: 'transparent'
        }}
        aria-hidden="true"
      />
      <span className="mt-2 text-muted small">{label}</span>
    </div>
  );
};

export default LoadingSpinner;

