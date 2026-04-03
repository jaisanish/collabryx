/**
 * middlewares/auth.ts
 * 
 * This file contains custom Express middlewares.
 * Middlewares are functions that run during the request/response lifecycle.
 * They are typically used for validation, authentication, and modifying request objects.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type to include our custom user property
// This allows us to attach the decoded JWT payload (like user ID) to the request
export interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

/**
 * requireAuth Middleware
 * 
 * This middleware checks if an incoming HTTP request has a valid JWT token.
 * If the token is valid, it attaches the user data to `req.user` and calls next() to proceed.
 * If the token is missing or invalid, it immediately rejects the request with a 401 Unauthorized status.
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Look for the Authorization header, which usually looks like "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     res.status(401).json({ error: 'Unauthorized: No token provided' });
     return;
  }

  // Extract the token string itself
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using our secret key. If it fails, an error is thrown.
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Attach the decoded user payload to the request for the next handler to use
    req.user = decoded;
    
    // Proceed to the actual route handler!
    next();
  } catch (err) {
    // If the token is expired or altered, jwt.verify throws an error
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};
