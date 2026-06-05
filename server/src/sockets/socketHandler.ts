import { Server, Socket } from 'socket.io';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { handleAutoReply, clearAutoReply } from './autoReplier';

interface User {
  socketId: string;
  roomId: string;
  senderType: 'visitor' | 'support';
  displayName: string;
}

const users: Map<string, User> = new Map();

const suicideRiskPhrases = [
  'i want to kill myself', 'i want to die', "i don't want to live anymore",
  'i want to end my life', 'i wish i was dead', 'kill myself', 'end my life',
  'suicide', 'no reason to live', 'better off dead'
];

const detectSuicideRisk = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return suicideRiskPhrases.some(phrase => lowerMessage.includes(phrase));
};

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_room', async (data: { roomId: string; senderType: 'visitor' | 'support'; displayName: string }) => {
      const { roomId, senderType, displayName } = data;
      
      socket.join(roomId);
      
      users.set(socket.id, { socketId: socket.id, roomId, senderType, displayName });

      io.to(roomId).emit('user_online', {
        userId: socket.id, displayName, senderType, timestamp: new Date().toISOString()
      });

      // Notify support dashboard of new user
      if (senderType === 'visitor') {
        io.emit('new_visitor', { roomId, displayName, timestamp: new Date().toISOString() });
      }

      await Conversation.findOneAndUpdate({ roomId }, { updatedAt: new Date() });
    });

    socket.on('send_message', async (data: { roomId: string; content: string; senderType: 'visitor' | 'support'; senderName: string; imageUrl?: string }) => {
      try {
        const { roomId, content, senderType, senderName, imageUrl } = data;

        // Auto-reply for first visitor message
        handleAutoReply(socket, io, data);

        const isSuicideRisk = detectSuicideRisk(content);

        const message = new Message({
          roomId, senderType, senderName, content: content.trim(), imageUrl, read: false
        });

        await message.save();

        await Conversation.findOneAndUpdate({ roomId }, { updatedAt: new Date() });

        const messageData = {
          _id: message._id, roomId, senderType, senderName,
          content: content.trim(), imageUrl, read: false, createdAt: message.createdAt
        };

        io.to(roomId).emit('receive_message', { ...messageData, suicideRisk: isSuicideRisk });

        // Notify support dashboard of new message
        if (senderType === 'visitor') {
          io.emit('new_support_message', { roomId, senderName, content: content.trim().substring(0, 50), suicideRisk: isSuicideRisk });
        }

        if (isSuicideRisk && senderType === 'visitor') {
          io.to(roomId).emit('suicide_risk_alert', {
            roomId, message: content.trim(), senderName, timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('typing', (data: { roomId: string; displayName: string }) => {
      socket.to(data.roomId).emit('user_typing', { displayName: data.displayName, userId: socket.id });
    });

    socket.on('stop_typing', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user_stop_typing', { userId: socket.id });
    });

    socket.on('message_read', async (data: { roomId: string; messageIds: string[] }) => {
      await Message.updateMany({ _id: { $in: data.messageIds } }, { read: true });
      socket.to(data.roomId).emit('messages_read', { messageIds: data.messageIds, readBy: socket.id });
    });

    socket.on('delete_message', async (data: { roomId: string; messageId: string }) => {
      await Message.findByIdAndDelete(data.messageId);
      io.to(data.roomId).emit('message_deleted', { messageId: data.messageId, deletedBy: socket.id });
    });

    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (user) {
        io.to(user.roomId).emit('user_offline', {
          userId: socket.id, displayName: user.displayName, timestamp: new Date().toISOString()
        });
        clearAutoReply(user.roomId);
        users.delete(socket.id);
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};
