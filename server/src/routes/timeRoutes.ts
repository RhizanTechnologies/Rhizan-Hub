import { Router } from 'express';
import {
  getTimeEntries,
  logTime,
  getWeeklySummary,
} from '../controllers/timeController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTimeEntries);
router.post('/', logTime);
router.get('/weekly-summary', getWeeklySummary);

export default router;
