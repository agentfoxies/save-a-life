import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  username: string;
  password: string;
  role: 'owner' | 'moderator' | 'volunteer';
  approved: boolean;
  currentStatus: string;
  lastActive: Date;
  tokenVersion: number;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'moderator', 'volunteer'], default: 'volunteer' },
  approved: { type: Boolean, default: false },
  currentStatus: { type: String, enum: ['online', 'busy', 'away', 'offline'], default: 'offline' },
  lastActive: { type: Date, default: Date.now },
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
