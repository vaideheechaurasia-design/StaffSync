import React from 'react';
import Icon from './Icon.jsx';

export const SummaryCard = ({
  label,
  value,
  icon = 'activity',
  variant = 'indigo', // indigo, emerald, amber, blue, rose
  changeText = null,
  trend = null, // { type: 'up' | 'down', value: string }
  className = '',
  onClick = null
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
      case 'success':
        return {
          bg: '#ECFDF5',
          text: '#059669',
          border: '#A7F3D0'
        };
      case 'amber':
      case 'warning':
        return {
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FDE68A'
        };
      case 'rose':
      case 'danger':
        return {
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FECACA'
        };
      case 'blue':
      case 'info':
        return {
          bg: '#EFF6FF',
          text: '#2563EB',
          border: '#BFDBFE'
        };
      case 'purple':
        return {
          bg: '#F5F3FF',
          text: '#7C3AED',
          border: '#DDD6FE'
        };
      case 'indigo':
      default:
        return {
          bg: '#EEF2FF',
          text: '#4F46E5',
          border: '#C7D2FE'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <article
      className={`ss-stat-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      aria-label={`${label}: ${value}`}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div className="flex-grow-1">
          <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6875rem', letterSpacing: '0.06em' }}>
            {label}
          </p>
          <div className="d-flex align-items-baseline gap-2">
            <h2 className="mb-0 fw-bold" style={{ fontSize: '1.75rem', color: 'var(--ss-color-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </h2>
            {trend && (
              <span className={`badge ${trend.type === 'up' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${trend.type === 'up' ? 'text-success' : 'text-danger'} fw-semibold`} style={{ fontSize: '0.75rem' }}>
                <Icon name={trend.type === 'up' ? 'trending-up' : 'trending-down'} size={12} className="me-1" />
                {trend.value}
              </span>
            )}
          </div>
          {changeText && (
            <p className="mt-2 mb-0 text-muted" style={{ fontSize: '0.8125rem' }}>
              {changeText}
            </p>
          )}
        </div>

        {icon && (
          <div
            className="ss-stat-icon-wrapper"
            style={{
              backgroundColor: vStyles.bg,
              color: vStyles.text
            }}
            aria-hidden="true"
          >
            {typeof icon === 'string' && icon.length > 2 ? (
              <Icon name={icon} size={24} color={vStyles.text} strokeWidth={2} />
            ) : typeof icon === 'string' ? (
              <span style={{ fontSize: '1.25rem' }}>{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default SummaryCard;
