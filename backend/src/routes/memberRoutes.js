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
  getProfessionStats,
  getRegistrationTrend,
  requestRenewal,
  getRenewals,
  approveRenewal,
  rejectRenewal,
  updateMember,
  deleteMember
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
 * GET /api/members/dashboard/profession-stats
 * Get profession statistics for pie chart (Admin only)
 * Note: Must come before /:id route to avoid matching as /:id
 */
router.get('/dashboard/profession-stats', authenticateToken, getProfessionStats);

/**
 * GET /api/members/dashboard/registration-trend
 * Get registration trend for line chart (Admin only)
 * Query params: days (optional, default 30)
 * Note: Must come before /:id route to avoid matching as /:id
 */
router.get('/dashboard/registration-trend', authenticateToken, getRegistrationTrend);

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

/**
 * PUT /api/members/:id
 * Update member data (Admin only)
 */
router.put('/:id', authenticateToken, upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]), updateMember);

/**
 * DELETE /api/members/:id
 * Delete member (Admin only)
 */
router.delete('/:id', authenticateToken, deleteMember);

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
