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

const router = Router();

router.post('/', createConversation);
router.get('/stats', getStats);
router.get('/:roomId', getConversation);
router.get('/', getAllConversations);
router.patch('/:roomId/status', updateConversationStatus);
router.delete('/:roomId', deleteConversation);
router.post("/:roomId/rating", (req, res) => { const { rating, feedback } = req.body; Conversation.findOneAndUpdate({ roomId: req.params.roomId }, { rating, feedback }, { new: true }).then(c => res.json(c)).catch(e => res.status(500).json({ error: e.message })); });
router.delete('/', deleteAllConversations);
router.post("/:roomId/rating", (req, res) => { const { rating, feedback } = req.body; Conversation.findOneAndUpdate({ roomId: req.params.roomId }, { rating, feedback }, { new: true }).then(c => res.json(c)).catch(e => res.status(500).json({ error: e.message })); });

export { router as conversationRoutes };
