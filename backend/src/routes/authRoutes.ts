/**
 * routes/authRoutes.ts
 * 
 * This file binds HTTP routes related to authentication 
 * to their respective controller functions.
 */

import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint: POST /api/auth/signup
// Handled by the 'signup' function exported from the auth controller
router.post('/signup', signup);

// Endpoint: POST /api/auth/login
// Handled by the 'login' function exported from the auth controller
router.post('/login', login);

// Example of a Protected Route within the Auth module
// Endpoint: GET /api/auth/me
// The 'requireAuth' middleware will intercept the request and verify the JWT token
// before executing the inline function.
router.get('/me', requireAuth, (req, res) => {
  // At this stage, req.user exists because requireAuth validated the JWT.
  res.json({ message: 'You have verified your token successfully!', user: (req as any).user });
});

export default router;
