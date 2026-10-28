import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const TrainingCatalog = () => {
  const { role } = useAuth();
  const [enrolledMap, setEnrolledMap] = useState({ 'tr-1': true });

  const PROGRAMS = [
    { id: 'tr-1', title: 'Advanced React Patterns & Performance', trainer: 'Tech Excellence Academy', dates: 'Nov 15 – Nov 16, 2026', capacity: 25, enrolled: 18, location: 'Virtual Room Alpha', description: 'Deep dive into React 18 hooks, concurrency, code-splitting, and render tree optimizations.' },
    { id: 'tr-2', title: 'Effective Engineering Leadership & Mentorship', trainer: 'Leadership Studio', dates: 'Nov 22, 2026', capacity: 15, enrolled: 12, location: 'Campus Alpha — Room 204', description: 'Strategies for conducting constructive 1-on-1s, giving architectural feedback, and mitigating burnout.' },
    { id: 'tr-3', title: 'OWASP Security Fundamentals for Web Devs', trainer: 'CyberSec Labs', dates: 'Dec 02, 2026', capacity: 30, enrolled: 30, location: 'Virtual Room Beta', description: 'Hands-on mitigation against injection, broken access control, and cross-site scripting vulnerabilities.' }
  ];

  const handleToggleEnroll = (programId) => {
    setEnrolledMap((prev) => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  return (
    <div>
      <PageHeader
        title="Training & Professional Development"
        subtitle="Discover internal workshops, expand your technical skill sets, and self-enroll in upcoming sessions."
        breadcrumbs={[{ label: 'Training', path: '/training' }]}
        actionButton={
          role === 'HR_ADMIN' ? (
            <Link to="/training/manage" className="btn btn-accent btn-sm">
              ➕ Schedule Workshop
            </Link>
          ) : null
        }
      />

      <PlaceholderNotice
        featureName="Training Catalog & Seat Capacity Engine"
        targetPhase="Phase 10 (Announcements & Training Management)"
        description="Displays approved training cards, seat counters, and enrollment states. Automatic capacity decrement and registration persistence connect in Phase 10."
      />

      <div className="row g-4">
        {PROGRAMS.map((prog) => {
          const isEnrolled = !!enrolledMap[prog.id];
          const isFull = prog.enrolled >= prog.capacity && !isEnrolled;

          return (
            <div key={prog.id} className="col-12 col-md-6 col-xl-4">
              <div className="ss-card ss-card-hover p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-light text-dark border">{prog.location}</span>
                    <StatusBadge status={isFull ? 'INACTIVE' : 'UPCOMING'} />
                  </div>
                  <h2 className="h5 fw-bold mb-1" style={{ color: 'var(--ss-color-primary)' }}>
                    {prog.title}
                  </h2>
                  <p className="small text-muted mb-2">
                    Instructor: <strong>{prog.trainer}</strong>
                  </p>
                  <p className="text-muted small mb-3">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center small mb-3">
                    <span className="text-muted">📅 {prog.dates}</span>
                    <span className="badge bg-secondary font-monospace">
                      {isEnrolled ? prog.enrolled : prog.enrolled} / {prog.capacity} Seats
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`btn btn-sm w-100 ${
                      isEnrolled
                        ? 'btn-outline-danger'
                        : isFull
                        ? 'btn-secondary disabled'
                        : 'btn-accent'
                    }`}
                    onClick={() => handleToggleEnroll(prog.id)}
                    disabled={isFull}
                  >
                    {isEnrolled ? '✓ Registered (Click to Drop)' : isFull ? 'Workshop Full' : 'Enroll in Workshop'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingCatalog;

