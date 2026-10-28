import React from 'react';

const STATUS_CONFIGS = {
  // Leave statuses
  APPROVED: { label: 'Approved', variant: 'success', icon: '✓' },
  PENDING: { label: 'Pending', variant: 'warning', icon: '⏳' },
  REJECTED: { label: 'Rejected', variant: 'danger', icon: '✕' },
  CANCELLED: { label: 'Cancelled', variant: 'danger', icon: '✕' },

  // Attendance statuses
  PRESENT: { label: 'Present', variant: 'success', icon: '●' },
  LATE: { label: 'Late', variant: 'warning', icon: '▲' },
  HALF_DAY: { label: 'Half Day', variant: 'warning', icon: '◐' },
  ABSENT: { label: 'Absent', variant: 'danger', icon: '■' },

  // Employee/Account statuses
  ACTIVE: { label: 'Active', variant: 'success', icon: '●' },
  INACTIVE: { label: 'Inactive', variant: 'danger', icon: '○' },
  ON_LEAVE: { label: 'On Leave', variant: 'info', icon: '✈' },

  // Training statuses
  UPCOMING: { label: 'Upcoming', variant: 'info', icon: '📅' },
  ONGOING: { label: 'Ongoing', variant: 'warning', icon: '⚡' },
  COMPLETED: { label: 'Completed', variant: 'success', icon: '✓' }
};

export const StatusBadge = ({ status = 'PENDING', className = '' }) => {
  const normalizedStatus = String(status).toUpperCase();
  const config = STATUS_CONFIGS[normalizedStatus] || {
    label: status,
    variant: 'info',
    icon: 'ℹ'
  };

  return (
    <span
      className={`ss-badge ss-badge-${config.variant} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span aria-hidden="true" style={{ fontSize: '0.85em', fontWeight: 'bold' }}>
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

