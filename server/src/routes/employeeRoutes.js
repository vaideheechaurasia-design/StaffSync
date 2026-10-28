import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// All employee endpoints require an authenticated session
router.use(verifyToken);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', requireRole('HR_ADMIN'), createEmployee);
router.put('/:id', requireRole('HR_ADMIN'), updateEmployee);
router.delete('/:id', requireRole('HR_ADMIN'), deleteEmployee);

export default router;
