/**
 * controllers/workspaceController.ts
 * 
 * Contains business logic for managing code workspaces.
 * All these functions assume the user is authenticated and `req.user` is populated.
 */

import { Response } from 'express';
// We import AuthRequest to get proper TypeScript typing for req.user
import { AuthRequest } from '../middlewares/authMiddleware';
import Workspace from '../models/Workspace';

/**
 * Handle Workspace creation (POST /api/workspaces)
 * Expects `name` and optional `language` in the request body.
 */
export const createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, language } = req.body;
    
    // We expect req.user to be populated by authMiddleware. It holds the JWT payload.
    // Ensure we safely cast to extract the userId.
    const userPayload = req.user as any;
    const userId = userPayload?.userId;

    if (!name) {
      res.status(400).json({ error: 'Workspace name is required.' });
      return;
    }

    // Generate random 6 character alphanumeric join code
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create a new Workspace document and immediately add the creator to the `members` array
    const workspace = await Workspace.create({
      name,
      description: description || '',
      joinCode,
      language: language || 'javascript',
      code: '// Start coding here...',
      createdBy: userId,
      members: [userId] // Creator is the first member
    });

    res.status(201).json({
      message: 'Workspace created successfully.',
      workspace
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Internal server error while creating workspace.' });
  }
};

/**
 * Retrieve Workspace details (GET /api/workspaces/:id)
 * Fetches the workspace configuration and code by its Database ID.
 */
export const getWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found.' });
      return;
    }

    // Since this route is authenticated but inherently open (or restricted if we wanted),
    // we return the workspace data so the UI can populate the Monaco Editor.
    res.status(200).json({ workspace });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Internal server error while fetching workspace.' });
  }
};

/**
 * Join an existing Workspace (POST /api/workspaces/join)
 * Adds the authenticated user to the workspace's `members` array if not already present.
 */
export const joinWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { joinCode } = req.body;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;

    if (!joinCode) {
      res.status(400).json({ error: 'Join code is required.' });
      return;
    }

    const workspace = await Workspace.findOne({ joinCode: joinCode.toUpperCase() });
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found or invalid join code.' });
      return;
    }

    // Check if the user is already in the members array
    // Convert ObjectIds to strings to accurately compare
    const isAlreadyMember = workspace.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isAlreadyMember) {
      // Add user to the members array and persist to database
      workspace.members.push(userId);
      await workspace.save();
    }

    res.status(200).json({
      message: 'Successfully joined workspace.',
      workspace
    });
  } catch (error) {
    console.error('Error joining workspace:', error);
    res.status(500).json({ error: 'Internal server error while joining workspace.' });
  }
};

/**
 * Get all workspaces for the authenticated user (GET /api/workspaces)
 * Fetches workspaces where the user is in the members array.
 */
export const getUserWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as any;
    const userId = userPayload?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Find all workspaces where the current user's ID is in the members array
    const workspaces = await Workspace.find({ members: userId }).sort({ createdAt: -1 });

    const formattedWorkspaces = workspaces.map((ws: any) => ({
      ...ws.toObject(),
      isCreator: ws.createdBy.toString() === userId
    }));

    res.status(200).json({ workspaces: formattedWorkspaces });
  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    res.status(500).json({ error: 'Internal server error while fetching user workspaces.' });
  }
};

/**
 * Delete a workspace (DELETE /api/workspaces/:id)
 * Only the creator can do this.
 */
export const deleteWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found.' });
      return;
    }

    if (workspace.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only the creator can delete the workspace.' });
      return;
    }

    await Workspace.findByIdAndDelete(id);
    res.status(200).json({ message: 'Workspace deleted successfully.' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Internal server error while deleting workspace.' });
  }
};

/**
 * Leave a workspace (POST /api/workspaces/:id/leave)
 */
export const leaveWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found.' });
      return;
    }

    // Check if user is the creator
    if (workspace.createdBy.toString() === userId) {
      if (workspace.members.length <= 1) {
        // Creator is the only one left, delete the workspace entirely
        await Workspace.findByIdAndDelete(id);
        res.status(200).json({ message: 'Workspace deleted as you were the only member.' });
        return;
      }
      
      // Need a new owner if leaving
      if (!newOwnerId) {
        res.status(400).json({ error: 'You are the creator. You must transfer ownership to a valid member to leave.' });
        return;
      }

      // Verify new owner is a member
      if (!workspace.members.some(m => m.toString() === newOwnerId)) {
        res.status(400).json({ error: 'New owner must be an existing workspace member.' });
        return;
      }

      workspace.createdBy = newOwnerId;
    }

    // Remove user from members
    workspace.members = workspace.members.filter((m: any) => m.toString() !== userId);
    await workspace.save();

    res.status(200).json({ message: 'Successfully left the workspace.', workspace });
  } catch (error) {
    console.error('Error leaving workspace:', error);
    res.status(500).json({ error: 'Internal server error while leaving workspace.' });
  }
};

/**
 * Regenerate join code (PATCH /api/workspaces/:id/regenerate-code)
 * Only the creator can do this.
 */
export const regenerateJoinCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found.' });
      return;
    }

    if (workspace.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only the creator can regenerate the join code.' });
      return;
    }

    const newJoinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    workspace.joinCode = newJoinCode;
    await workspace.save();

    res.status(200).json({ 
      message: 'Join code regenerated successfully.', 
      joinCode: newJoinCode 
    });
  } catch (error) {
    console.error('Error regenerating join code:', error);
    res.status(500).json({ error: 'Internal server error while regenerating join code.' });
  }
};

