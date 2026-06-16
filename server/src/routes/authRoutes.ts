import { Router } from 'express';
import { login, register, updateStatus, verifyToken, getAdmins, approveAdmin, promoteToOwner, demoteToModerator, removeAdmin, authMiddleware } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify', verifyToken);
router.get('/admins', authMiddleware, getAdmins);
router.patch('/admins/:adminId/approve', authMiddleware, approveAdmin);
router.patch('/admins/:adminId/promote', authMiddleware, promoteToOwner);
router.patch('/admins/:adminId/demote', authMiddleware, demoteToModerator);
router.delete('/admins/:adminId', authMiddleware, removeAdmin);
router.patch('/status', authMiddleware, updateStatus);

export { router as authRoutes };
