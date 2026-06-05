import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  senderType: 'visitor' | 'support';
  senderName: string;
  content: string;
  imageUrl?: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  senderType: {
    type: String,
    enum: ['visitor', 'support'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  imageUrl: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

MessageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);