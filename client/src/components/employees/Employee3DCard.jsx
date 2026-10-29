import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge.jsx';
import Icon from '../common/Icon.jsx';

export const Employee3DCard = ({
  employee,
  role,
  onDeactivate = null,
  isDeactivating = false
}) => {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const calculateTilt = (clientX, clientY) => {
    if (prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Calculate normalized coordinates (-1 to 1) from card center
    const xPct = Math.max(-1, Math.min(1, (mouseX / width - 0.5) * 2));
    const yPct = Math.max(-1, Math.min(1, (mouseY / height - 0.5) * 2));

    // Maximum tilt angles in degrees
    const maxTilt = 12;
    const rotateX = -yPct * maxTilt;
    const rotateY = xPct * maxTilt;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`
    );

    // Dynamic light specular glare
    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;
    setGlareStyle({
      opacity: 0.18,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 70%)`
    });
  };

  const handleMouseMove = (e) => {
    calculateTilt(e.clientX, e.clientY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    resetTransform();
  };

  // Touch Screen Support
  const handleTouchStart = () => {
    setIsHovered(true);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      calculateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    resetTransform();
  };

  // Keyboard Focus Handling
  const handleFocus = () => {
    setIsFocused(true);
    if (!prefersReducedMotion) {
      setTransformStyle('perspective(1000px) rotateX(2deg) rotateY(0deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)');
      setGlareStyle({
        opacity: 0.1,
        background: 'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 65%)'
      });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    resetTransform();
  };

  const resetTransform = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  };

  const empId = employee._id || employee.id;
  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || 'Unnamed Staff';
  const email = employee.userId?.email || employee.email || 'No email registered';
  const deptName = employee.departmentId?.name || (typeof employee.departmentId === 'string' ? employee.departmentId : 'Unassigned');
  const deptCode = employee.departmentId?.code || 'GEN';
  const initials = `${employee.firstName?.[0] || 'U'}${employee.lastName?.[0] || ''}`.toUpperCase();

  const isElevated = isHovered || isFocused;

  return (
    <div
      className="ss-3d-card-wrapper h-100"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      role="article"
      aria-label={`Employee profile card for ${fullName}`}
    >
      <div
        ref={cardRef}
        className="ss-3d-card ss-card h-100 d-flex flex-column justify-content-between position-relative overflow-hidden"
        style={{
          transform: prefersReducedMotion ? 'none' : transformStyle,
          transition: isElevated ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease-out',
          transformStyle: 'preserve-3d',
          willChange: isHovered ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          borderRadius: '16px',
          border: isElevated ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          boxShadow: isElevated
            ? '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)'
            : '0 1px 3px 0 rgba(15, 23, 42, 0.06)'
        }}
      >
        {/* Dynamic Light Specular Glare Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
          style={{
            ...glareStyle,
            transition: 'opacity 0.25s ease-out',
            zIndex: 3,
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        />

        {/* Card Header & Accent Border */}
        <div className="p-4 pb-2" style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>
          {/* Top Bar with Department & Status (Floats in 3D space) */}
          <div
            className="d-flex justify-content-between align-items-center mb-3"
            style={{ transform: 'translateZ(20px)' }}
          >
            <span className="badge bg-light text-secondary border font-monospace px-2.5 py-1" style={{ fontSize: '0.75rem' }}>
              {employee.employeeCode}
            </span>
            <StatusBadge status={employee.status} />
          </div>

          {/* Profile Identity & Avatar (Parallax Depth Layer) */}
          <div
            className="d-flex align-items-center gap-3 mb-3"
            style={{ transform: 'translateZ(25px)' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow flex-shrink-0"
              style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #0F172A 0%, #312E81 100%)',
                fontSize: '1.25rem',
                border: '2px solid #EEF2FF',
                boxShadow: isElevated ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'box-shadow 0.3s ease'
              }}
            >
              {initials}
            </div>

            <div className="text-truncate">
              <h3 className="h6 fw-bold mb-0 text-dark text-truncate" style={{ letterSpacing: '-0.01em' }}>
                {fullName}
              </h3>
              <div className="text-primary fw-medium small text-truncate">
                {employee.designation || 'Staff Member'}
              </div>
              <div className="text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>
                {deptName}
              </div>
            </div>
          </div>

          {/* Contact Details Information */}
          <div
            className="p-2.5 rounded-3 bg-light border mb-2 small text-muted"
            style={{ transform: 'translateZ(10px)' }}
          >
            <div className="d-flex align-items-center gap-1.5 text-truncate mb-1">
              <Icon name="mail" size={13} color="#64748B" />
              <span className="text-truncate" style={{ fontSize: '0.75rem' }}>{email}</span>
            </div>
            <div className="d-flex align-items-center gap-1.5 text-truncate">
              <Icon name="building" size={13} color="#64748B" />
              <span className="text-truncate" style={{ fontSize: '0.75rem' }}>
                Unit: {deptName} ({deptCode})
              </span>
            </div>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div
          className="p-4 pt-2 border-top mt-auto bg-light bg-opacity-50"
          style={{ transform: 'translateZ(12px)' }}
        >
          <div className="d-flex justify-content-between align-items-center gap-2">
            <Link
              to={`/employees/${empId}`}
              className="btn btn-sm btn-outline-primary flex-grow-1 shadow-xs d-flex align-items-center justify-content-center gap-1.5"
            >
              <Icon name="user" size={14} />
              <span>Full Profile</span>
            </Link>

            {role === 'HR_ADMIN' && employee.status !== 'INACTIVE' && onDeactivate && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger p-2"
                onClick={() => onDeactivate(empId, fullName)}
                disabled={isDeactivating}
                title="Deactivate staff record"
                aria-label="Deactivate staff record"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employee3DCard;