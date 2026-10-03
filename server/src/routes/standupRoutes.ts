import { Router } from 'express';
import { getTodayStandups, submitStandup } from '../controllers/standupController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/today', getTodayStandups);
router.post('/', submitStandup);

export default router;
