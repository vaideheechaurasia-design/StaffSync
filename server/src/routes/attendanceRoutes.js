import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getTeamAttendance,
  getAllAttendance,
  createAttendanceRecord,
  updateAttendanceRecord
} from '../controllers/attendanceController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// Enforce authentication on all attendance operations
router.use(verifyToken);

// Employee Self-Service Punch & History Routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyHistory);

// Manager / HR Team Attendance
router.get(
  '/team',
  requireRole(USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN),
  getTeamAttendance
);

// Administrative Attendance Management (HR_ADMIN only)
router.get(
  '/',
  requireRole(USER_ROLES.HR_ADMIN),
  getAllAttendance
);

router.get(
  '/all',
  requireRole(USER_ROLES.HR_ADMIN),
  getAllAttendance
);

router.post(
  '/',
  requireRole(USER_ROLES.HR_ADMIN),
  createAttendanceRecord
);

router.post(
  '/manual',
  requireRole(USER_ROLES.HR_ADMIN),
  createAttendanceRecord
);

router.put(
  '/:id',
  requireRole(USER_ROLES.HR_ADMIN),
  updateAttendanceRecord
);

export default router;
