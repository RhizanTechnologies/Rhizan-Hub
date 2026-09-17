import { Router } from 'express';
import { getTeam } from '../controllers/teamController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getTeam);

export default router;
