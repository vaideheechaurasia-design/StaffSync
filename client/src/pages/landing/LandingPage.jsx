import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthService } from '../../api/healthService.js';

export const LandingPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    healthService.checkHealth()
      .then((res) => {
        if (isMounted) {
          setHealthData(res.data);
          setHealthLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setHealthLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="py-5">
      {/* Hero Section */}
      <section className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <span className="badge px-3 py-2 mb-3 rounded-pill" style={{ backgroundColor: 'rgba(0, 173, 181, 0.15)', color: 'var(--ss-color-accent-hover)', fontWeight: 600 }}>
              Phase 4: MERN Foundation Active
            </span>
            <h1 className="display-4 fw-bold mb-3" style={{ color: 'var(--ss-color-primary)', letterSpacing: '-0.02em' }}>
              People First. Work Smarter.
            </h1>
            <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '680px' }}>
              StaffSync is an enterprise-grade Human Resource Management System digitizing workforce records, daily attendance tracking, multi-tier leave approval lifecycles, and HR analytics.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <Link to="/dashboard" className="btn btn-accent btn-lg px-4 shadow-sm">
                Open Application Shell →
              </Link>
              <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">
                Sign In Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Backend API Live Diagnostics Card */}
      <section className="container mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="ss-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--ss-color-primary)' }}>
                  🩺 Backend Express API Health Status
                </h3>
                <span className={`badge ${healthData ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {healthLoading ? 'Testing...' : healthData ? 'Online (HTTP 200)' : 'Offline / Starting'}
                </span>
              </div>
              <p className="small text-muted mb-2">
                Verified connectivity to endpoint: <code>GET /api/v1/health</code>
              </p>
              {healthData ? (
                <div className="bg-light p-3 rounded border font-monospace small">
                  <div><strong>Status:</strong> {healthData.status || 'healthy'}</div>
                  <div><strong>Environment:</strong> {healthData.environment}</div>
                  <div><strong>Server Uptime:</strong> {healthData.uptimeSeconds}s</div>
                  <div><strong>Database:</strong> {healthData.database?.message}</div>
                </div>
              ) : (
                <div className="text-muted small">
                  Backend server check in progress... Ensure <code>npm run server</code> is listening on port 5000.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Roles Overview */}
      <section className="container py-4">
        <h2 className="text-center h3 fw-bold mb-5" style={{ color: 'var(--ss-color-primary)' }}>
          Tailored Workspaces for Every Role
        </h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="ss-card p-4 h-100">
              <div className="fs-1 mb-3">🏢</div>
              <h3 className="h5 fw-bold mb-2">HR / Administrator</h3>
              <p className="text-muted small mb-3">
                Comprehensive governance: employee lifecycle onboarding, department structures, leave quota administration, announcements, and executive workforce analytics.
              </p>
              <Link to="/dashboard/hr" className="btn btn-sm btn-outline-primary">
                Preview HR Portal →
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="ss-card p-4 h-100">
              <div className="fs-1 mb-3">👥</div>
              <h3 className="h5 fw-bold mb-2">Manager Portal</h3>
              <p className="text-muted small mb-3">
                Departmental productivity: monitor daily team attendance, review subordinate leave applications, prevent scheduling conflicts, and track workshop participation.
              </p>
              <Link to="/dashboard/manager" className="btn btn-sm btn-outline-primary">
                Preview Manager Portal →
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="ss-card p-4 h-100">
              <div className="fs-1 mb-3">💼</div>
              <h3 className="h5 fw-bold mb-2">Employee Self-Service</h3>
              <p className="text-muted small mb-3">
                Staff member empowerment: 1-click check-in/out, leave quota balances, time-off requests, corporate bulletins, and skill development enrollment.
              </p>
              <Link to="/dashboard/employee" className="btn btn-sm btn-outline-primary">
                Preview Employee Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

