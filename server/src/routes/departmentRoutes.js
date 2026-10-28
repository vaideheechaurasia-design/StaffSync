import { Router } from 'express';
import { getDepartments, getDepartmentById, createDepartment } from '../controllers/departmentController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Department routes (all require authentication)
router.use(verifyToken);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requireRole('HR_ADMIN'), createDepartment);

export default router;
