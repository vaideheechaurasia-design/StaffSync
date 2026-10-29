import React from 'react';
import Icon from './Icon.jsx';

const STATUS_CONFIGS = {
  // Leave statuses
  APPROVED: { label: 'Approved', variant: 'success', iconName: 'check-circle' },
  PENDING: { label: 'Pending', variant: 'warning', iconName: 'clock' },
  REJECTED: { label: 'Rejected', variant: 'danger', iconName: 'x' },
  CANCELLED: { label: 'Cancelled', variant: 'danger', iconName: 'x' },

  // Attendance statuses
  PRESENT: { label: 'Present', variant: 'success', iconName: 'check' },
  LATE: { label: 'Late', variant: 'warning', iconName: 'clock' },
  HALF_DAY: { label: 'Half Day', variant: 'warning', iconName: 'clock' },
  ABSENT: { label: 'Absent', variant: 'danger', iconName: 'x' },

  // Employee/Account statuses
  ACTIVE: { label: 'Active', variant: 'success', iconName: 'check-circle' },
  INACTIVE: { label: 'Inactive', variant: 'danger', iconName: 'x' },
  ON_LEAVE: { label: 'On Leave', variant: 'info', iconName: 'plane' },

  // Training statuses
  UPCOMING: { label: 'Upcoming', variant: 'info', iconName: 'calendar' },
  ONGOING: { label: 'Ongoing', variant: 'warning', iconName: 'clock' },
  COMPLETED: { label: 'Completed', variant: 'success', iconName: 'check-circle' }
};

export const StatusBadge = ({ status = 'PENDING', className = '', showDot = true }) => {
  const normalizedStatus = String(status).toUpperCase();
  const config = STATUS_CONFIGS[normalizedStatus] || {
    label: status,
    variant: 'info',
    iconName: 'info'
  };

  return (
    <span
      className={`ss-badge ss-badge-${config.variant} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showDot ? (
        <span className="ss-badge-dot" aria-hidden="true" />
      ) : (
        <Icon name={config.iconName} size={13} className="me-1" />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
