/**
 * controllers/authController.ts
 * 
 * This file contains the core business logic for authentication.
 * It strictly handles incoming HTTP requests from the auth routes and sends back the appropriate HTTP response.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

/**
 * Handle new user registration (POST /api/auth/signup)
 * 1. Validates that name, email, and password were provided.
 * 2. Checks if an account under the provided email already exists.
 * 3. Securely hashes the plaintext password via bcrypt.
 * 4. Saves the user record to MongoDB.
 * 5. Mints and returns a JSON Web Token to seamlessly log the user in immediately.
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Fast-fail if missing required fields
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Please provide name, email, and password.' });
      return;
    }

    // Security check: ensure email is uniquely registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email already exists.' });
      return;
    }

    // Cryptography: Hash the password.
    // 10 is the salt rounds factor—a good balance between speed and security.
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Save the newly structured user document into MongoDB
    const newUser = await User.create({
      name,
      email,
      passwordHash
    });

    // Create the JWT so the user doesn't have to log in post-signup
    // Contains the user's DB ID in the payload. Expires in 24 hours.
    const secret = process.env.JWT_SECRET || 'fallback_dev_secret';
    const token = jwt.sign({ userId: newUser._id }, secret, { expiresIn: '1d' });

    res.status(201).json({
      message: 'User created successfully.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal server error during signup.' });
  }
};

/**
 * Handle existing user authentication (POST /api/auth/login)
 * 1. Checks if a user under the provided email exists.
 * 2. Compares the provided plaintext password against the hashed password stored in the DB.
 * 3. If everything matches, mints and returns a JWT.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Fast-fail missing fields
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password.' });
      return;
    }

    // Attempt to locate the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      // Intentionally vague error message to prevent email enumeration attacks
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Compare the provided password with the hashed password from the DB
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // User is fully authenticated, generate their token
    const secret = process.env.JWT_SECRET || 'fallback_dev_secret';
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};
