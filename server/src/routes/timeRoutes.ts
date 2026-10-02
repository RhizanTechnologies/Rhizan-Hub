import { Router } from 'express';
import {
  getTimeEntries,
  logTime,
  updateTimeEntry,
  deleteTimeEntry,
  getWeeklySummary,
} from '../controllers/timeController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTimeEntries);
router.post('/', logTime);
router.put('/:id', updateTimeEntry);
router.delete('/:id', deleteTimeEntry);
router.get('/weekly-summary', getWeeklySummary);

export default router;
