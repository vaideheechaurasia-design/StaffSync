import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthService } from '../../api/healthService.js';
import Icon from '../../components/common/Icon.jsx';

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

  const features = [
    {
      title: 'Employee Lifecycle',
      description: 'Centralized directory, detailed job profiles, emergency contacts, and seamless staff onboarding.',
      icon: 'users',
      color: '#4F46E5',
      bg: '#EEF2FF'
    },
    {
      title: 'Time & Attendance',
      description: 'One-click daily punches, shift calculation, automated late arrival flags, and audit logs.',
      icon: 'clock',
      color: '#059669',
      bg: '#ECFDF5'
    },
    {
      title: 'Leave & Time-Off',
      description: 'Live quota balances, business-day calculation, collision prevention, and manager approval queues.',
      icon: 'calendar',
      color: '#D97706',
      bg: '#FFFBEB'
    },
    {
      title: 'Department Governance',
      description: 'Structured business units, departmental headcount tracking, and designated unit managers.',
      icon: 'building',
      color: '#2563EB',
      bg: '#EFF6FF'
    },
    {
      title: 'Enterprise RBAC',
      description: 'Strict role-based access control protecting HR Admin, Manager, and Employee workspaces.',
      icon: 'shield',
      color: '#7C3AED',
      bg: '#F5F3FF'
    },
    {
      title: 'Security & Integrity',
      description: 'Stateless HTTP-only JWT sessions, bcrypt hashing, automated testing, and MongoDB Atlas persistence.',
      icon: 'lock',
      color: '#0F172A',
      bg: '#F1F5F9'
    }
  ];

  return (
    <div className="py-4 py-md-5">
      {/* Hero Section */}
      <section className="container py-4 text-center">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3 border" style={{ backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', fontSize: '0.8125rem', color: '#4F46E5' }}>
              <Icon name="sparkles" size={15} />
              <span className="fw-semibold">Enterprise SaaS Edition • Production Ready</span>
            </div>

            <h1 className="display-4 fw-bold mb-3" style={{ color: 'var(--ss-color-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              People First. Work Smarter.
            </h1>

            <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '720px', fontSize: '1.125rem' }}>
              StaffSync is a next-generation Human Resource Management System digitizing workforce records, attendance compliance, multi-tier leave approval lifecycles, and executive organizational governance.
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <Link to="/dashboard" className="btn btn-accent btn-lg px-4 shadow">
                <span>Open Application Portal</span>
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline-secondary btn-lg px-4 shadow-sm">
                <Icon name="log-in" size={18} />
                <span>Sign In Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mb-5">
        <div className="text-center mb-4">
          <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '0.08em' }}>
            Comprehensive Capabilities
          </span>
          <h2 className="h4 fw-bold text-dark mt-1">Built for Modern Organizations</h2>
        </div>

        <div className="row g-4">
          {features.map((feat, idx) => (
            <div key={idx} className="col-12 col-md-6 col-lg-4">
              <div className="ss-card ss-card-hover p-4 h-100">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '48px', height: '48px', backgroundColor: feat.bg, color: feat.color }}
                >
                  <Icon name={feat.icon} size={24} color={feat.color} />
                </div>
                <h3 className="h6 fw-bold mb-2 text-dark">
                  {feat.title}
                </h3>
                <p className="text-muted small mb-0 lh-base">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Backend API Live Diagnostics Card */}
      <section className="container mb-4">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="ss-card p-4 p-md-5 shadow-sm">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: healthData?.database?.status === 'connected' ? '#10B981' : '#EF4444',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
                    }}
                  />
                  <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                    Live Backend & Cloud Infrastructure Status
                  </h3>
                </div>
                <span className={`badge ${healthData ? 'bg-success' : 'bg-warning text-dark'} px-2.5 py-1 font-monospace`}>
                  {healthLoading ? 'Checking...' : healthData ? 'MongoDB Atlas Connected' : 'Checking Connection'}
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 border">
                <div className="row g-3 small">
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block">Environment</span>
                    <strong className="text-dark font-monospace">{healthData?.environment || 'development'}</strong>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block">Database Engine</span>
                    <strong className="text-dark">MongoDB Atlas Cloud</strong>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block">System Version</span>
                    <strong className="text-dark font-monospace">v{healthData?.version || '1.0.0'}</strong>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block">Server Uptime</span>
                    <strong className="text-dark font-monospace">{healthData?.uptimeSeconds || 0} seconds</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
