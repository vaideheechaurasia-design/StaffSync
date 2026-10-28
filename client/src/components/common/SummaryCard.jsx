import React from 'react';

export const SummaryCard = ({
  label,
  value,
  icon,
  variant = 'primary',
  changeText = null,
  className = ''
}) => {
  return (
    <article
      className={`ss-card ss-card-hover p-3 h-100 ${className}`}
      aria-label={`${label}: ${value}`}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
            {label}
          </p>
          <h2 className="h2 mb-0 fw-bold" style={{ color: 'var(--ss-color-primary)' }}>
            {value}
          </h2>
          {changeText && (
            <p className="mt-2 mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
              {changeText}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '46px',
              height: '46px',
              backgroundColor: 'var(--ss-color-surface-alt)',
              fontSize: '1.25rem'
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </article>
  );
};

export default SummaryCard;

