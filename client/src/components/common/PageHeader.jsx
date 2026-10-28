import React from 'react';
import { Link } from 'react-router-dom';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actionButton = null
}) => {
  return (
    <header className="mb-4">
      {/* Breadcrumbs Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.825rem' }}>
            <li className="breadcrumb-item">
              <Link to="/dashboard" className="text-decoration-none" style={{ color: 'var(--ss-color-secondary)' }}>
                Home
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <li key={index} className="breadcrumb-item active text-muted" aria-current="page">
                  {crumb.label}
                </li>
              ) : (
                <li key={index} className="breadcrumb-item">
                  <Link to={crumb.path} className="text-decoration-none" style={{ color: 'var(--ss-color-secondary)' }}>
                    {crumb.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title & Action Row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <div>
          <h1 className="h3 mb-1 fw-bold" style={{ color: 'var(--ss-color-primary)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
    </header>
  );
};

export default PageHeader;

