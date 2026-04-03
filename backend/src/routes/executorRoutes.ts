import express from 'express';
import { executeCode } from '../controllers/executorController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * POST /api/execute
 * 
 * Secure route for executing code. 
 * Requires a valid JWT token in the Authorization header.
 */
router.post('/', requireAuth, executeCode);

export default router;
