import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Public authentication endpoints
router.post('/login', login);
router.post('/logout', logout);

// Protected authentication endpoints
router.get('/me', verifyToken, getMe);

export default router;
