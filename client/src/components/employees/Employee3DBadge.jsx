import React, { useState, useRef, useEffect } from 'react';
import Icon from '../common/Icon.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

export const Employee3DBadge = ({ employee }) => {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
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

    const xPct = Math.max(-1, Math.min(1, (mouseX / width - 0.5) * 2));
    const yPct = Math.max(-1, Math.min(1, (mouseY / height - 0.5) * 2));

    const maxTilt = 16;
    const rotateX = -yPct * maxTilt;
    const rotateY = xPct * maxTilt;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`
    );

    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;
    setGlareStyle({
      opacity: 0.25,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 65%)`
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
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      calculateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  if (!employee) return null;

  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || 'Staff Member';
  const initials = `${employee.firstName?.[0] || 'U'}${employee.lastName?.[0] || ''}`.toUpperCase();
  const deptName = employee.departmentId?.name || 'Department Staff';
  const deptCode = employee.departmentId?.code || 'GEN';
  const roleName = employee.userId?.role || 'EMPLOYEE';

  return (
    <div
      className="position-relative d-inline-block w-100"
      style={{ perspective: '1200px', maxWidth: '340px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovered(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="rounded-4 p-4 text-white position-relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transform: prefersReducedMotion ? 'none' : transformStyle,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
          willChange: isHovered ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          minHeight: '440px',
          boxShadow: isHovered
            ? '0 25px 50px -12px rgba(49, 46, 129, 0.45)'
            : '0 20px 25px -5px rgba(15, 23, 42, 0.25)'
        }}
      >
        {/* Specular glare */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
          style={{
            ...glareStyle,
            transition: 'opacity 0.25s ease-out',
            zIndex: 10,
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        />

        {/* Lanyard / Clip Hole */}
        <div className="d-flex justify-content-center mb-3" style={{ transform: 'translateZ(10px)' }}>
          <div
            style={{
              width: '46px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          />
        </div>

        {/* Top Holographic Strip */}
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ transform: 'translateZ(20px)' }}>
          <div className="d-flex align-items-center gap-1.5">
            <Icon name="sparkles" size={16} color="#F59E0B" />
            <span className="fw-bold font-monospace" style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', color: '#E0E7FF' }}>
              STAFFSYNC IDENT
            </span>
          </div>
          <span className="badge bg-indigo-500 bg-opacity-30 text-white font-monospace border border-indigo-400 border-opacity-30" style={{ fontSize: '0.6875rem' }}>
            {deptCode}
          </span>
        </div>

        {/* Smartcard Chip Simulation */}
        <div className="mb-3" style={{ transform: 'translateZ(25px)' }}>
          <div
            style={{
              width: '44px',
              height: '34px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #AA771C 100%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            {/* Chip Circuit Lines */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: '100%',
                height: '1px',
                backgroundColor: 'rgba(0,0,0,0.25)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                height: '100%',
                width: '1px',
                backgroundColor: 'rgba(0,0,0,0.25)'
              }}
            />
          </div>
        </div>

        {/* Center Avatar & Identity in 3D Parallax Space */}
        <div className="text-center my-3" style={{ transform: 'translateZ(35px)' }}>
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow-lg mb-2"
            style={{
              width: '74px',
              height: '74px',
              background: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)',
              fontSize: '1.75rem',
              color: '#FFFFFF',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
            }}
          >
            {initials}
          </div>
          <h2 className="h5 fw-bold text-white mb-0 text-truncate px-2">
            {fullName}
          </h2>
          <div className="text-indigo-200 small fw-medium text-truncate">
            {employee.designation || 'Staff Associate'}
          </div>
        </div>

        {/* Badge Metadata Grid */}
        <div
          className="p-2.5 rounded-3 mb-3"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            transform: 'translateZ(20px)',
            fontSize: '0.75rem'
          }}
        >
          <div className="d-flex justify-content-between mb-1">
            <span className="text-white-50">CODE</span>
            <span className="font-monospace fw-bold text-white">{employee.employeeCode}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-white-50">DEPT</span>
            <span className="text-white fw-semibold text-truncate ms-2">{deptName}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-white-50">CLEARANCE</span>
            <span className="badge bg-white text-dark font-monospace py-0.5" style={{ fontSize: '0.6875rem' }}>
              {roleName}
            </span>
          </div>
        </div>

        {/* Bottom Barcode Graphic */}
        <div className="mt-auto pt-2 text-center" style={{ transform: 'translateZ(15px)' }}>
          <div
            className="d-flex justify-content-center align-items-center gap-1 opacity-75 mb-1"
            style={{ height: '22px' }}
          >
            {[4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 3, 2, 6, 4, 2, 5, 1, 3, 5, 2, 4].map((h, idx) => (
              <span
                key={idx}
                style={{
                  width: `${(idx % 3) + 1.5}px`,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1px'
                }}
              />
            ))}
          </div>
          <div className="font-monospace text-white-50" style={{ fontSize: '0.625rem', letterSpacing: '0.15em' }}>
            SECURED CREDENTIAL • MONGO-ATLAS
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employee3DBadge;

