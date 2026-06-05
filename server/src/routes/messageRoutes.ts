import { Router } from 'express';
import {
  getMessages,
  uploadImage,
  deleteMessage,
  markAsRead,
  uploadMiddleware
} from '../controllers/messageController';

const router = Router();

router.get('/:roomId', getMessages);
router.post('/upload', uploadMiddleware, uploadImage);
router.delete('/:messageId', deleteMessage);
router.patch('/:roomId/read', markAsRead);

export { router as messageRoutes };