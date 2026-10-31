import { Router } from 'express';
import { getConnectionStatus } from '../config/db.js';

const router = Router();

/**
 * Liveness probe: returns HTTP 200 when the Express server process is running.
 */
export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    status: 'healthy',
    message: 'StaffSync service is operational.',
    timestamp: new Date().toISOString()
  });
};

/**
 * Readiness probe: checks actual database connectivity.
 * - HTTP 200 when MongoDB is connected and ready.
 * - HTTP 503 when MongoDB is disconnected or connecting.
 */
export const getReadinessStatus = (req, res) => {
  const dbStatus = getConnectionStatus();
  const isDbConnected = dbStatus.status === 'connected';

  if (isDbConnected) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      status: 'ready',
      message: 'StaffSync database is connected and ready.',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({
    success: false,
    statusCode: 503,
    status: 'not_ready',
    message: 'StaffSync database is disconnected.',
    timestamp: new Date().toISOString()
  });
};

// Liveness routes
router.get('/', getHealthStatus);
router.get('/health', getHealthStatus);

// Readiness routes
router.get('/ready', getReadinessStatus);
router.get('/readiness', getReadinessStatus);

export default router;
