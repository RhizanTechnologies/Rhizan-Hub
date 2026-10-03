import { Router } from 'express';
import { getTeam, getTeamMemberDetails, updateTeamMember } from '../controllers/teamController';
import { inviteMember, resendInvite } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getTeam);
router.get('/:id', getTeamMemberDetails);
router.patch('/:id', requireAdmin, updateTeamMember);
router.post('/invite', requireAdmin, inviteMember);
router.post('/:id/resend-invite', requireAdmin, resendInvite);

export default router;
