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
  getDashboardStats,
  requestRenewal,
  getRenewals,
  approveRenewal,
  rejectRenewal
} from '../controllers/memberController.js';
import { upload } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';

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
// PROTECTED ROUTES (Admin only - JWT required)
// ============================================

/**
 * GET /api/members
 * Get all members (Admin only)
 */
router.get('/', authenticateToken, getAllMembers);

/**
 * GET /api/members/dashboard/stats
 * Get dashboard statistics (Admin only)
 * Note: Must come before /:id route to avoid matching as /:id
 */
router.get('/dashboard/stats', authenticateToken, getDashboardStats);

/**
 * GET /api/members/:id
 * Get member by ID (Admin only)
 */
router.get('/:id', authenticateToken, getMemberById);

/**
 * PUT /api/members/:id/approve
 * Approve member registration (Admin only)
 */
router.put('/:id/approve', authenticateToken, approveMember);

/**
 * PUT /api/members/:id/reject
 * Reject member registration (Admin only)
 */
router.put('/:id/reject', authenticateToken, rejectMember);

// ============================================
// RENEWAL ROUTES (Admin only - JWT required)
// ============================================

/**
 * POST /api/members/:id/renewal-request
 * Request membership renewal (Public - no auth required)
 */
router.post('/:id/renewal-request', requestRenewal);

/**
 * GET /api/members/renewals
 * Get all renewal requests (Admin only)
 */
router.get('/renewals/list', authenticateToken, getRenewals);

/**
 * PUT /api/members/renewals/:renewalId/approve
 * Approve renewal request (Admin only)
 */
router.put('/renewals/:renewalId/approve', authenticateToken, approveRenewal);

/**
 * PUT /api/members/renewals/:renewalId/reject
 * Reject renewal request (Admin only)
 */
router.put('/renewals/:renewalId/reject', authenticateToken, rejectRenewal);

export default router;
