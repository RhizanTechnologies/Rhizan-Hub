import { Router } from 'express';
import { register, login, getMe, changePassword, inviteMember } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, changePassword);
router.post('/invite', authenticateToken, requireAdmin, inviteMember);

export default router;
