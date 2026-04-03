/**
 * routes/workspaceRoutes.ts
 * 
 * This file binds Workspace HTTP routes to the logic implemented in the controller.
 * All these routes fall under the protected umbrella via our JWT middleware.
 */

import { Router } from 'express';
import { createWorkspace, getWorkspace, joinWorkspace, getUserWorkspaces, deleteWorkspace, leaveWorkspace, regenerateJoinCode } from '../controllers/workspaceController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Apply requireAuth middleware to ALL routes within this router automatically.
// This is a cleaner approach than inserting `requireAuth` individually onto each route.
router.use(requireAuth);

/**
 * Route Mapping:
 * GET  /api/workspaces        -> getUserWorkspaces
 * POST /api/workspaces        -> createWorkspace
 * GET  /api/workspaces/:id    -> getWorkspace
 * POST /api/workspaces/join -> joinWorkspace
 * DELETE /api/workspaces/:id  -> deleteWorkspace
 * POST /api/workspaces/:id/leave -> leaveWorkspace
 * PATCH /api/workspaces/:id/regenerate-code -> regenerateJoinCode
 */
router.get('/', getUserWorkspaces);
router.post('/', createWorkspace);
router.post('/join', joinWorkspace);
router.get('/:id', getWorkspace);
router.delete('/:id', deleteWorkspace);
router.post('/:id/leave', leaveWorkspace);
router.patch('/:id/regenerate-code', regenerateJoinCode);

export default router;
