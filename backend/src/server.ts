/**
 * server.ts
 * 
 * This is the main entry point for the backend of Collabryx.
 * It sets up the Express application, configures middleware (like CORS and JSON body parsing),
 * connects to MongoDB, and initializes Socket.IO for real-time bidirectional communication.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import snapshotRoutes from './routes/snapshotRoutes';
import executorRoutes from './routes/executorRoutes';
import Workspace from './models/Workspace';

// Load variables from the .env file into process.env so we can access them securely
dotenv.config();

// Initialize the Express router application
const app: Application = express();

// Create a standard HTTP server using the Express setup. This is required because Socket.IO
// needs a direct HTTP server instance to bind its WebSocket engine to, rather than just Express.
const server = http.createServer(app);

// Setup Socket.IO for real-time collaboration features (like the synchronous code editor)
const io = new Server(server, {
  cors: {
    origin: '*', // Allows connections from any frontend origin. (Should be restricted to actual frontend URL in production!)
    methods: ['GET', 'POST']
  }
});

// Middleware configuration:
// 1. cors(): Allows our frontend React app (running on a different port) to make API calls here
// 2. express.json(): Automatically parses incoming JSON request bodies into JS objects (req.body)
app.use(cors());
app.use(express.json());

// A simple health-check API endpoint to verify the server is running
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Collabryx backend is running.' });
});

// Authentication Routes
// All routes defined in authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Workspace Routes
// Protected routes for managing and joining collaborative coding workspaces
app.use('/api/workspaces', workspaceRoutes);

// Snapshot Routes
app.use('/api/snapshots', snapshotRoutes);

// Code Execution Routes
app.use('/api/execute', executorRoutes);

// Socket.IO Connection Handler
// It listens for every new client connection and sets up their specific socket events
io.on('connection', (socket) => {
  console.log(`📡 User connected with socket ID: ${socket.id}`);
  
  // 1. Join Room: Place the user into a specific socket room based on the workspace ID.
  // This ensures that broadcasting is isolated to users viewing the same document.
  socket.on('join-workspace', (workspaceId: string) => {
    socket.join(workspaceId);
    console.log(`👤 Socket ${socket.id} joined workspace room: ${workspaceId}`);
  });

  // 2. Code Change: Listen for real-time cursor/code updates from clients.
  socket.on('code-change', async (data: { workspaceId: string, newCode: string }) => {
    const { workspaceId, newCode } = data;
    
    // Broadcast the new code to everyone ELSE currently in that room to keep them in sync
    socket.to(workspaceId).emit('code-change', newCode);

    try {
      // Save the latest code snapshot directly to the database.
      // This ensures that when new users join or the server restarts, the latest state is preserved.
      await Workspace.findByIdAndUpdate(workspaceId, { code: newCode });
    } catch (err) {
      console.error(`Failed to push code to database for workspace ${workspaceId}:`, err);
    }
  });

  // 3. Language Change: Sync the editor language across all collaborators
  socket.on('language-change', async (data: { workspaceId: string, newLanguage: string }) => {
    const { workspaceId, newLanguage } = data;
    
    // Broadcast the new language to everyone ELSE in the room
    socket.to(workspaceId).emit('language-change', newLanguage);

    try {
      // Persist the language choice in the database
      await Workspace.findByIdAndUpdate(workspaceId, { language: newLanguage });
    } catch (err) {
      console.error(`Failed to update language in database for workspace ${workspaceId}:`, err);
    }
  });

  // Handle disconnection event to clean up orphaned sockets
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Global Error Handler Middleware
// Catches any unhandled errors in route handlers to prevent the server from crashing
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send({ error: 'Internal Server Error' });
});

// Determine which port to run the server on (from .env or default to 5000)
const PORT = process.env.PORT || 5000;

/**
 * startServer()
 * 
 * An asynchronous function to first connect to the database, and only then
 * start the HTTP server listening for requests.
 */
const startServer = async () => {
  try {
    // Attempt Database connection
    if (process.env.MONGO_URI && process.env.MONGO_URI !== 'your_mongodb_cluster_uri_here') {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Successfully connected to MongoDB');
    } else {
      console.warn('⚠️ MONGO_URI is missing or placeholder. Starting server WITHOUT database connection.');
    }

    // Start listening for inbound connections
    server.listen(PORT, () => {
      console.log(`🚀 Server successfully running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1); // Force exit if we couldn't start properly
  }
};

// Execute the startup function
startServer();
