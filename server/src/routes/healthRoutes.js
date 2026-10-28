import { Router } from 'express';
import { config } from '../config/env.js';

const router = Router();

export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    status: 'healthy',
    message: 'StaffSync HRMS API is operational.',
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: config.env,
      version: '1.0.0',
      database: {
        status: 'pending_configuration',
        message: 'MongoDB Atlas connection will be configured in Phase 5.'
      },
      services: {
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

