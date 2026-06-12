import { Router } from 'express';
import {
  createConversation,
  getConversation,
  getAllConversations,
  updateConversationStatus,
  getStats,
  deleteConversation,
  deleteAllConversations
} from '../controllers/conversationController';
import { Conversation } from '../models/Conversation';

const router = Router();

router.post('/', createConversation);
router.get('/stats', getStats);
router.get('/:roomId', getConversation);
router.get('/', getAllConversations);
router.patch('/:roomId/status', updateConversationStatus);
router.delete('/:roomId', deleteConversation);
router.delete('/', deleteAllConversations);

// Star rating route
router.post('/:roomId/rating', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const conversation = await Conversation.findOneAndUpdate(
      { roomId: req.params.roomId },
      { rating, feedback },
      { new: true }
    );
    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as conversationRoutes };
