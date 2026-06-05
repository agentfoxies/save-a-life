import { Server, Socket } from 'socket.io';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';

interface User {
  socketId: string;
  roomId: string;
  senderType: 'visitor' | 'support';
  displayName: string;
}

const users: Map<string, User> = new Map();

// Suicide risk detection phrases
const suicideRiskPhrases = [
  'i want to kill myself',
  'i want to die',
  'i don\'t want to live anymore',
  'i want to end my life',
  'i wish i was dead',
  'kill myself',
  'end my life',
  'suicide',
  'no reason to live',
  'better off dead'
];

const detectSuicideRisk = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return suicideRiskPhrases.some(phrase => lowerMessage.includes(phrase));
};

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    // Join a room
    socket.on('join_room', async (data: { roomId: string; senderType: 'visitor' | 'support'; displayName: string }) => {
      const { roomId, senderType, displayName } = data;
      
      socket.join(roomId);
      
      users.set(socket.id, {
        socketId: socket.id,
        roomId,
        senderType,
        displayName
      });

      // Notify room about user joining
      io.to(roomId).emit('user_online', {
        userId: socket.id,
        displayName,
        senderType,
        timestamp: new Date().toISOString()
      });

      // Update conversation timestamp
      await Conversation.findOneAndUpdate(
        { roomId },
        { updatedAt: new Date() }
      );

      console.log(`${displayName} joined room ${roomId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data: { roomId: string; content: string; senderType: 'visitor' | 'support'; senderName: string; imageUrl?: string }) => {
      try {
        const { roomId, content, senderType, senderName, imageUrl } = data;

        // Check for suicide risk
        const isSuicideRisk = detectSuicideRisk(content);

        // Create message in database
        const message = new Message({
          roomId,
          senderType,
          senderName,
          content: content.trim(),
          imageUrl,
          read: false
        });

        await message.save();

        // Update conversation timestamp
        await Conversation.findOneAndUpdate(
          { roomId },
          { updatedAt: new Date() }
        );

        // Send message to room
        const messageData = {
          _id: message._id,
          roomId,
          senderType,
          senderName,
          content: content.trim(),
          imageUrl,
          read: false,
          createdAt: message.createdAt
        };

        io.to(roomId).emit('receive_message', {
          ...messageData,
          suicideRisk: isSuicideRisk
        });

        // If suicide risk detected, send alert to support
        if (isSuicideRisk && senderType === 'visitor') {
          io.to(roomId).emit('suicide_risk_alert', {
            roomId,
            message: content.trim(),
            senderName,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { roomId: string; displayName: string }) => {
      socket.to(data.roomId).emit('user_typing', {
        displayName: data.displayName,
        userId: socket.id
      });
    });

    // Handle stop typing
    socket.on('stop_typing', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user_stop_typing', {
        userId: socket.id
      });
    });

    // Handle message read
    socket.on('message_read', async (data: { roomId: string; messageIds: string[] }) => {
      const { roomId, messageIds } = data;
      
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { read: true }
      );

      socket.to(roomId).emit('messages_read', {
        messageIds,
        readBy: socket.id
      });
    });

    // Handle message deletion
    socket.on('delete_message', async (data: { roomId: string; messageId: string }) => {
      const { roomId, messageId } = data;
      
      await Message.findByIdAndDelete(messageId);
      
      io.to(roomId).emit('message_deleted', {
        messageId,
        deletedBy: socket.id
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      
      if (user) {
        io.to(user.roomId).emit('user_offline', {
          userId: socket.id,
          displayName: user.displayName,
          timestamp: new Date().toISOString()
        });
        
        users.delete(socket.id);
      }
      
      console.log('Client disconnected:', socket.id);
    });
  });
};