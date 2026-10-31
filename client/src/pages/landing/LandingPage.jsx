import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';

export const LandingPage = () => {
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
      title: 'Enterprise Security',
      description: 'Role-based access governance, secure encrypted sessions, audit-ready activity trails, and strict data protection.',
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
              <span className="fw-semibold">Enterprise Workforce Platform</span>
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

      {/* Enterprise Platform Overview Card */}
      <section className="container mb-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div
              className="p-4 p-md-5 rounded-4 shadow-sm text-dark position-relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
                border: '1px solid #E2E8F0'
              }}
            >
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 border bg-white text-primary" style={{ fontSize: '0.75rem' }}>
                    <Icon name="sparkles" size={13} color="#4F46E5" />
                    <span className="fw-semibold">Unified Human Resources Platform</span>
                  </div>
                  <h3 className="h4 fw-bold text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Streamline Your Workforce Governance
                  </h3>
                  <p className="text-muted small mb-3 mb-lg-0" style={{ lineHeight: 1.6 }}>
                    StaffSync delivers role-specific portals tailored for HR Executives, Department Managers, and Staff Members. Monitor real-time headcount, track daily shift punctuality, manage multi-tiered leave approval workflows, and govern organizational departments seamlessly.
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <Link to="/login" className="btn btn-accent btn-md px-4 shadow-sm d-inline-flex align-items-center gap-2">
                    <span>Sign In to Portal</span>
                    <Icon name="arrow-right" size={16} />
                  </Link>
                </div>
              </div>

              <div className="row g-3 pt-4 mt-2 border-top">
                <div className="col-6 col-md-3">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="users" size={18} color="#4F46E5" />
                    <div>
                      <span className="fw-bold text-dark d-block small">Directory</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Full Lifecycle</span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="clock" size={18} color="#059669" />
                    <div>
                      <span className="fw-bold text-dark d-block small">Attendance</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Live Shifts & Logs</span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="calendar" size={18} color="#D97706" />
                    <div>
                      <span className="fw-bold text-dark d-block small">Leave Center</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Multi-Tier Review</span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="shield" size={18} color="#7C3AED" />
                    <div>
                      <span className="fw-bold text-dark d-block small">Role Security</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Strict RBAC</span>
                    </div>
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
