import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getMyBalance,
  getPendingApprovals,
  getAllLeaves,
  getLeaveById,
  reviewLeave,
  cancelLeave
} from '../controllers/leaveController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// Enforce authentication on all leave operations
router.use(verifyToken);

// Self-Service Employee Leave Endpoints
router.post('/', applyLeave);
router.get('/my-requests', getMyLeaves);
router.get('/my-leaves', getMyLeaves);
router.get('/my-balance', getMyBalance);

// Manager / HR Approvals Queue
router.get(
  '/pending-approvals',
  requireRole(USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN),
  getPendingApprovals
);

router.get(
  '/pending',
  requireRole(USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN),
  getPendingApprovals
);

// Organization-Wide Leave Registry (HR_ADMIN only)
router.get(
  '/',
  requireRole(USER_ROLES.HR_ADMIN),
  getAllLeaves
);

// Individual Record Retrieval
router.get('/:id', getLeaveById);

// Manager / HR Decisioning (Approve / Reject)
router.patch(
  '/:id/status',
  requireRole(USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN),
  reviewLeave
);

router.put(
  '/:id/status',
  requireRole(USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN),
  reviewLeave
);

// Self-Service Cancellation
router.delete('/:id', cancelLeave);
router.patch('/:id/cancel', cancelLeave);

export default router;
