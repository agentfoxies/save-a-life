import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  roomId: string;
  displayName: string;
  anonymous: boolean;
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);