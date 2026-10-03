import { Router } from 'express';
import { getWeeklyReport } from '../controllers/reportController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/weekly', getWeeklyReport);

export default router;
