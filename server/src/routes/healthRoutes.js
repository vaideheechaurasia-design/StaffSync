import { Router } from 'express';
import { config } from '../config/env.js';
import { getConnectionStatus } from '../config/db.js';

const router = Router();

export const getHealthStatus = (req, res) => {
  const dbStatus = getConnectionStatus();
  const isDbConnected = dbStatus.status === 'connected';

  res.status(200).json({
    success: true,
    statusCode: 200,
    status: isDbConnected ? 'healthy' : 'degraded',
    message: isDbConnected
      ? 'StaffSync HRMS API and Database are operational.'
      : 'StaffSync HRMS API is operational (database disconnected).',
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: config.env,
      version: '1.0.0',
      database: dbStatus,
      services: {
        database: isDbConnected ? 'Phase 5 (Connected)' : 'Phase 5 (Disconnected)',
        authentication: 'Phase 6 (JWT + HTTP-only cookies)',
        employeeManagement: 'Phase 7',
        attendanceEngine: 'Phase 8',
        leaveWorkflows: 'Phase 9'
      }
    }
  });
};

router.get('/', getHealthStatus);
router.get('/health', getHealthStatus);

export default router;
