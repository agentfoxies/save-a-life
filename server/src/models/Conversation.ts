import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  roomId: string;
  displayName: string;
  anonymous: boolean;
  mood: string;
  status: 'active' | 'closed';
  handledBy: string;
  rating: number;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true },
  anonymous: { type: Boolean, default: false },
  mood: { type: String },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  handledBy: { type: String },
  rating: { type: Number },
  notes: [{ text: String, author: String, createdAt: { type: Date, default: Date.now } }],
  feedback: { type: String }
}, {
  timestamps: true
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
