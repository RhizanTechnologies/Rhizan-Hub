import { Router } from 'express';
import { getTeam } from '../controllers/teamController';
import { inviteMember } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getTeam);
router.post('/invite', requireAdmin, inviteMember);

export default router;
