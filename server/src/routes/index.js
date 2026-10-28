import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import leaveRoutes from './leaveRoutes.js';

const apiRouter = Router();

// Mount health check routes
apiRouter.use('/health', healthRoutes);

// Mount authentication routes
apiRouter.use('/auth', authRoutes);

// Mount employee management routes
apiRouter.use('/employees', employeeRoutes);

// Mount department management routes
apiRouter.use('/departments', departmentRoutes);

// Mount attendance management routes
apiRouter.use('/attendance', attendanceRoutes);

// Mount leave request management routes
apiRouter.use('/leaves', leaveRoutes);

// Root API information endpoint
apiRouter.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'StaffSync HRMS API',
    tagline: 'People First. Work Smarter.',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      employees: '/api/v1/employees',
      departments: '/api/v1/departments',
      attendance: '/api/v1/attendance',
      leaves: '/api/v1/leaves'
    }
  });
});

export default apiRouter;

