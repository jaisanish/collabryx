import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISnapshot extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  code: string;
  savedAt: Date;
}

const SnapshotSchema: Schema = new Schema({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name: { type: String, required: true, default: 'Snapshot' },
  code: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISnapshot>('Snapshot', SnapshotSchema);
