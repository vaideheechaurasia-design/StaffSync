import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const apiRouter = Router();

// Mount health check routes
apiRouter.use('/health', healthRoutes);

// Root API information endpoint
apiRouter.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'StaffSync HRMS API',
    tagline: 'People First. Work Smarter.',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      health: '/api/v1/health'
    }
  });
});

export default apiRouter;

