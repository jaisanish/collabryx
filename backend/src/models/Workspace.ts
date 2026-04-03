/**
 * models/Workspace.ts
 * 
 * This file defines the Mongoose Schema for a collaborative code Workspace.
 * A workspace represents a single coding session/document shared among multiple users..
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the TS interface for strong typing
export interface IWorkspace extends Document {
  name: string;
  description: string;
  joinCode: string;
  language: string;
  code: string;
  members: Types.ObjectId[]; // Array of User IDs who joined the workspace
  createdBy: Types.ObjectId;   // User ID of the creator
  createdAt: Date;
}

// Create the Mongoose Schema
const WorkspaceSchema: Schema = new Schema({
  // The display name of the workspace
  name: { type: String, required: true },
  
  // Optional description for the workspace
  description: { type: String, default: '' },
  
  // Unique generated join code
  joinCode: { type: String, unique: true },
  
  // The programming language selected (e.g., 'javascript', 'python')
  language: { type: String, required: true, default: 'javascript' },
  
  // The actual source code content within the editor
  code: { type: String, default: '' },
  
  // References to the Users who are currently part of this workspace
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // Reference to the User who originally created the workspace
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Auto-managed timestamp
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
