import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { createRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Protect login endpoint from automated brute-force attacks (30 attempts / 15m)
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

// Public authentication endpoints
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

// Protected authentication endpoints
router.get('/me', verifyToken, getMe);

export default router;
