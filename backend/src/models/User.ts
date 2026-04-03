/**
 * models/User.ts
 * 
 * This file contains the Mongoose schema and model for a User in the database.
 * Mongoose schemas define the structure of the document, default values, validators, etc.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the TypeScript interface representing a User document
// This provides type-checking across our application when handling user data
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// Create the Mongoose Schema defining the data structure in MongoDB
const UserSchema: Schema = new Schema({
  // Name must be a string and is required
  name: { type: String, required: true },
  
  // Email is required and unique
  email: { type: String, required: true, unique: true },
  
  // We store the hashed password, NEVER the plain-text password for security
  passwordHash: { type: String, required: true },
  
  // Automatically track when the user was created
  createdAt: { type: Date, default: Date.now }
});

// Compile the Schema into a Model and export it
// Models are responsible for creating and reading documents from the underlying MongoDB database
export default mongoose.model<IUser>('User', UserSchema);
