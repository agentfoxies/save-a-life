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
router.delete('/', deleteAllConversations);

export { router as conversationRoutes };
