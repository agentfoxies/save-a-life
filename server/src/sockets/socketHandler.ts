import { Server, Socket } from 'socket.io';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { handleAutoReply, loadRepliedRooms } from './autoReplier';

// Telegram config directly here
const TELEGRAM_BOT_TOKEN = '8851638627:AAEj2dvBhwgnzYDQBrBOhM6WZIKSB5CAsj4';
const TELEGRAM_GROUP_ID = '-5136710309';

async function sendToTelegram(text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_GROUP_ID, text, parse_mode: 'Markdown' })
    });
    console.log('✅ Telegram sent');
  } catch (e: any) {
    console.error('❌ Telegram failed:', e.message);
  }
}

interface User {
  socketId: string; roomId: string; senderType: 'visitor' | 'support'; displayName: string;
}

const users: Map<string, User> = new Map();

const suicideRiskPhrases = [
  'i want to kill myself', 'i want to die', "i don't want to live anymore",
  'i want to end my life', 'i wish i was dead', 'kill myself', 'end my life',
  'suicide', 'no reason to live', 'better off dead'
];

const detectSuicideRisk = (message: string): boolean => {
  return suicideRiskPhrases.some(phrase => message.toLowerCase().includes(phrase));
};

export const setupSocketHandlers = (io: Server) => {
  loadRepliedRooms();
  
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Connected:', socket.id);

    socket.on('join_room', async (data: { roomId: string; senderType: 'visitor' | 'support'; displayName: string }) => {
      const { roomId, senderType, displayName } = data;
      socket.join(roomId);
      users.set(socket.id, { socketId: socket.id, roomId, senderType, displayName });
      io.to(roomId).emit('user_online', { userId: socket.id, displayName, senderType });

      if (senderType === 'visitor') {
        console.log('🟢 Visitor:', displayName);
        io.emit('new_visitor', { roomId, displayName });
        const baseUrl = process.env.CLIENT_URL || 'https://save-a-life-q2p8.onrender.com';
        sendToTelegram(`🟢 *New visitor!*\n👤 ${displayName}\n🔗 [Reply](${baseUrl}/support/${roomId})`);
      }
      await Conversation.findOneAndUpdate({ roomId }, { updatedAt: new Date() });
    });

    socket.on('send_message', async (data: { roomId: string; content: string; senderType: 'visitor' | 'support'; senderName: string; imageUrl?: string }) => {
      try {
        const { roomId, content, senderType, senderName, imageUrl } = data;
        console.log('💬 Message:', senderName, '-', content.substring(0, 30));

        if (senderType === 'visitor') {
          handleAutoReply(io, data);
        }

        const isSuicideRisk = detectSuicideRisk(content);
        const message = new Message({ roomId, senderType, senderName, content: content.trim(), imageUrl, read: false });
        await message.save();
        await Conversation.findOneAndUpdate({ roomId }, { updatedAt: new Date() });

        io.to(roomId).emit('receive_message', {
          _id: message._id, roomId, senderType, senderName,
          content: content.trim(), imageUrl, read: false, createdAt: message.createdAt, suicideRisk: isSuicideRisk
        });

        if (senderType === 'visitor') {
          io.emit('new_support_message', { roomId, senderName, content: content.substring(0, 50), suicideRisk: isSuicideRisk });
          const baseUrl = process.env.CLIENT_URL || 'https://save-a-life-q2p8.onrender.com';
          const emoji = isSuicideRisk ? '🚨🚨🚨' : '📩';
          const riskText = isSuicideRisk ? '\n⚠️ *SUICIDE RISK - Respond immediately!*' : '';
          sendToTelegram(`${emoji} *${senderName}*\n💬 ${content.substring(0, 200)}\n🔗 [Reply](${baseUrl}/support/${roomId})${riskText}`);
        }

        if (isSuicideRisk) {
          io.to(roomId).emit('suicide_risk_alert', { roomId, message: content.trim(), senderName });
        }
      } catch (error) {
        console.error('Message error:', error);
      }
    });

    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (user) { users.delete(socket.id); }
    });
  });
};
