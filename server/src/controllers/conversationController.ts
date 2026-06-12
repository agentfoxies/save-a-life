import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { v4 as uuidv4 } from 'uuid';

const anonymousNames = [
  'Anonymous Tiger', 'Anonymous Falcon', 'Anonymous Ocean', 'Anonymous Star',
  'Anonymous Wolf', 'Anonymous Eagle', 'Anonymous River', 'Anonymous Moon',
  'Anonymous Phoenix', 'Anonymous Dragon', 'Anonymous Lion', 'Anonymous Bear'
];

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { displayName, anonymous, mood } = req.body;
    const roomId = uuidv4();
    const finalDisplayName = anonymous 
      ? anonymousNames[Math.floor(Math.random() * anonymousNames.length)]
      : displayName;

    if (!anonymous && (!displayName || displayName.trim().length === 0)) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const conversation = new Conversation({
      roomId,
      displayName: finalDisplayName,
      anonymous: anonymous || false,
      status: 'active'
    });

    await conversation.save();

    res.status(201).json({
      roomId: conversation.roomId,
      displayName: conversation.displayName,
      anonymous: conversation.anonymous,
      status: conversation.status,
      createdAt: conversation.createdAt
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const conversation = await Conversation.findOne({ roomId });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    const conversations = await Conversation.find(query).sort({ updatedAt: -1 }).limit(100);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const updateConversationStatus = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;
    if (!['active', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const conversation = await Conversation.findOneAndUpdate({ roomId }, { status }, { new: true });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conversation' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const [totalConversations, activeConversations, closedConversations] = await Promise.all([
      Conversation.countDocuments(),
      Conversation.countDocuments({ status: 'active' }),
      Conversation.countDocuments({ status: 'closed' })
    ]);
    res.json({ totalConversations, activeConversations, closedConversations, totalChats: totalConversations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    await Message.deleteMany({ roomId });
    await Conversation.findOneAndDelete({ roomId });
    res.json({ message: 'Conversation deleted permanently' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

export const deleteAllConversations = async (req: Request, res: Response) => {
  try {
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    res.json({ message: 'All conversations deleted permanently' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all conversations' });
  }
};
