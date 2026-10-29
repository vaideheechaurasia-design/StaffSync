import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actionButton = null,
  badge = null
}) => {
  return (
    <header className="mb-4">
      {/* Breadcrumbs Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0 align-items-center" style={{ fontSize: '0.8125rem' }}>
            <li className="breadcrumb-item d-flex align-items-center">
              <Link to="/dashboard" className="text-decoration-none text-muted d-flex align-items-center gap-1 hover-primary">
                <Icon name="dashboard" size={13} />
                <span>Dashboard</span>
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <li key={index} className="breadcrumb-item active text-dark fw-medium d-flex align-items-center" aria-current="page">
                  {crumb.label}
                </li>
              ) : (
                <li key={index} className="breadcrumb-item d-flex align-items-center">
                  <Link to={crumb.path} className="text-decoration-none text-muted hover-primary">
                    {crumb.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title & Action Row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="h3 mb-0 fw-bold" style={{ color: 'var(--ss-color-primary)', letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            {badge && (
              <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-100" style={{ fontSize: '0.75rem', backgroundColor: '#EEF2FF', color: '#4F46E5', borderColor: '#C7D2FE' }}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Primary and Secondary Action Buttons */}
        {actionButton && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {actionButton}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
