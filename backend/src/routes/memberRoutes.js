/**
 * Member Routes
 * API endpoints for member operations
 */

import express from 'express';
import {
  registerMember,
  getAllMembers,
  getMemberById,
  searchMembers,
  approveMember,
  rejectMember,
  getDashboardStats
} from '../controllers/memberController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/members/register
 * Register new member with file uploads
 */
router.post('/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]), registerMember);

/**
 * GET /api/members/search
 * Search members by query
 */
router.get('/search', searchMembers);

// ============================================
// PROTECTED ROUTES (Admin only - coming in Phase 3)
// ============================================

/**
 * GET /api/members
 * Get all members
 */
router.get('/', getAllMembers);

/**
 * GET /api/members/:id
 * Get member by ID
 */
router.get('/:id', getMemberById);

/**
 * PUT /api/members/:id/approve
 * Approve member registration
 */
router.put('/:id/approve', approveMember);

/**
 * PUT /api/members/:id/reject
 * Reject member registration
 */
router.put('/:id/reject', rejectMember);

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/dashboard/stats', getDashboardStats);

export default router;
