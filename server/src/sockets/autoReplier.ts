import { Message } from '../models/Message';

// Track rooms that have received auto-reply (persists across connections)
const repliedRooms = new Set<string>();

// Load existing replied rooms from database on startup
export const loadRepliedRooms = async () => {
  try {
    const messages = await Message.find({ 
      senderType: 'support', 
      senderName: 'Support Team',
      content: { $regex: 'Thank you for reaching out' }
    }).select('roomId');
    
    messages.forEach(msg => repliedRooms.add(msg.roomId));
    console.log(`Loaded ${repliedRooms.size} auto-replied rooms`);
  } catch (error) {
    console.error('Error loading replied rooms:', error);
  }
};

export const handleAutoReply = async (io: any, data: any) => {
  const { roomId, senderType, senderName } = data;
  
  // Only auto-reply to visitors
  if (senderType !== 'visitor') return;
  
  // Check if already replied (in memory)
  if (repliedRooms.has(roomId)) return;
  
  // Check if already replied (in database - extra safety)
  const existingReply = await Message.findOne({
    roomId,
    senderType: 'support',
    senderName: 'Support Team',
    content: { $regex: 'Thank you for reaching out' }
  });
  
  if (existingReply) {
    repliedRooms.add(roomId);
    return;
  }
  
  // Mark as replied immediately
  repliedRooms.add(roomId);
  
  // Wait 2 seconds then send ONE auto-reply
  setTimeout(async () => {
    try {
      const autoReplyMessage = new Message({
        roomId,
        senderType: 'support',
        senderName: 'Support Team',
        content: "Hi! 👋 Thank you for reaching out. I'm here to listen and support you. How can I help you today?",
        read: false
      });
      
      await autoReplyMessage.save();
      
      io.to(roomId).emit('receive_message', {
        _id: autoReplyMessage._id,
        roomId,
        senderType: 'support',
        senderName: 'Support Team',
        content: autoReplyMessage.content,
        read: false,
        createdAt: autoReplyMessage.createdAt
      });
    } catch (error) {
      // If save fails, remove from set so it can retry
      repliedRooms.delete(roomId);
      console.error('Error sending auto-reply:', error);
    }
  }, 2000);
};

export const clearAutoReply = (roomId: string) => {
  // Don't clear - keep it permanent so it never sends twice
};
