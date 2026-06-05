// Auto-reply when a user sends their first message
const firstMessageSent = new Set<string>();

export const handleAutoReply = (socket: any, io: any, data: any) => {
  const { roomId, senderType, senderName } = data;
  
  // Only auto-reply to visitors, not support staff
  if (senderType !== 'visitor') return;
  
  // Only auto-reply once per room
  if (firstMessageSent.has(roomId)) return;
  
  firstMessageSent.add(roomId);
  
  // Wait 2 seconds then send auto-reply
  setTimeout(() => {
    const autoReply = {
      roomId,
      senderType: 'support',
      senderName: 'Support Team',
      content: "Hi! 👋 Thank you for reaching out. I'm here to listen and support you. How can I help you today?",
      createdAt: new Date().toISOString()
    };
    
    io.to(roomId).emit('receive_message', autoReply);
  }, 2000);
};

export const clearAutoReply = (roomId: string) => {
  firstMessageSent.delete(roomId);
};
