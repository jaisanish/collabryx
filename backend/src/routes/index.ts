/**
 * routes/index.ts
 * 
 * This file orchestrates all the API endpoints for the backend.
 * By modularizing routes, we keep `server.ts` clean.
 * 
 * Usage in server.ts:
 * import routes from './routes';
 * app.use('/api', routes);
 */

import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';

// Initialize a new Express router instance
const router = Router();

/**
 * Public Routes - Anyone can access these
 * For example: Login, Registration, Health checks
 */
router.get('/public', (req, res) => {
  res.json({ message: 'This is a public endpoint accessible by anyone.' });
});

/**
 * Protected Routes - Only authenticated users can access
 * Notice how we insert the `requireAuth` middleware before the request handler.
 * If `requireAuth` fails, it halts the request, so the code below never runs.
 */
router.get('/protected', requireAuth, (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: (req as any).user });
});

// Export the central router to be used by server.ts
export default router;
