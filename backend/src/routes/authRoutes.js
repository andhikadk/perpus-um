/**
 * Auth Routes
 * Endpoints for authentication operations
 */

import express from 'express';
import { loginAdmin, verifyToken, logoutAdmin } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginAdmin);

// POST /api/auth/verify
router.post('/verify', verifyToken);

// POST /api/auth/logout
router.post('/logout', authenticateToken, logoutAdmin);

export default router;
