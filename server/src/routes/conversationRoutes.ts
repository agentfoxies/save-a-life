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

router.post('/:roomId/rating', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const c = await Conversation.findOneAndUpdate(
      { roomId: req.params.roomId }, { rating, feedback }, { new: true }
    );
    res.json(c);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/:roomId/notes', async (req, res) => {
  try {
    const { text, author } = req.body;
    const conversation = await Conversation.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $push: { notes: { text, author, createdAt: new Date() } } },
      { new: true }
    );
    res.json(conversation?.notes || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:roomId/notes', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ roomId: req.params.roomId });
    res.json(conversation?.notes || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:roomId/notes/:noteId', async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $pull: { notes: { _id: req.params.noteId } } },
      { new: true }
    );
    res.json(conversation?.notes || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export { router as conversationRoutes };
