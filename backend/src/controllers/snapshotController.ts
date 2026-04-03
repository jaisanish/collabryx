import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Snapshot from '../models/Snapshot';
import Workspace from '../models/Workspace';

/**
 * Helper to check if a user is a member of a workspace
 */
const checkMembership = (workspace: any, userId: string): boolean => {
  return workspace.members.some((m: any) => m.toString() === userId);
};

export const saveSnapshot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId, name } = req.body;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;
    
    if (!workspaceId) {
      res.status(400).json({ error: 'workspaceId is required' });
      return;
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    // Security Audit: Verify the user is a member of this workspace
    if (!checkMembership(workspace, userId)) {
      res.status(403).json({ error: 'Unauthorized: You are not a member of this workspace.' });
      return;
    }

    const snapshot = new Snapshot({
      workspaceId,
      name: name || 'Snapshot',
      code: workspace.code
    });

    await snapshot.save();

    res.status(201).json({ snapshot });
  } catch (error) {
    console.error('Error saving snapshot:', error);
    res.status(500).json({ error: 'Server error saving snapshot' });
  }
};

export const getSnapshots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;
    
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !checkMembership(workspace, userId)) {
      res.status(403).json({ error: 'Unauthorized to view snapshots for this workspace.' });
      return;
    }

    const snapshots = await Snapshot.find({ workspaceId }).sort({ savedAt: -1 });
    res.status(200).json({ snapshots });
  } catch (error) {
    console.error('Error getting snapshots:', error);
    res.status(500).json({ error: 'Server error retrieving snapshots' });
  }
};

export const restoreSnapshot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { snapshotId } = req.params;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;
    
    const snapshot = await Snapshot.findById(snapshotId);
    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    const workspace = await Workspace.findById(snapshot.workspaceId);
    if (!workspace || !checkMembership(workspace, userId)) {
      res.status(403).json({ error: 'Unauthorized to restore snapshots to this workspace.' });
      return;
    }

    workspace.code = snapshot.code;
    await workspace.save();

    res.status(200).json({ workspace, restoredCode: snapshot.code });
  } catch (error) {
    console.error('Error restoring snapshot:', error);
    res.status(500).json({ error: 'Server error restoring snapshot' });
  }
};

export const deleteSnapshot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { snapshotId } = req.params;
    const userPayload = req.user as any;
    const userId = userPayload?.userId;
    
    const snapshot = await Snapshot.findById(snapshotId);
    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    const workspace = await Workspace.findById(snapshot.workspaceId);
    if (!workspace || !checkMembership(workspace, userId)) {
      res.status(403).json({ error: 'Unauthorized to delete snapshots for this workspace.' });
      return;
    }

    await Snapshot.findByIdAndDelete(snapshotId);
    res.status(200).json({ message: 'Snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    res.status(500).json({ error: 'Server error deleting snapshot' });
  }
};

