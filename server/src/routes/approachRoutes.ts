import { Router } from 'express';
import {
  getApproaches,
  createApproach,
  updateApproach,
  deleteApproach,
  convertToClient,
} from '../controllers/approachController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getApproaches);
router.post('/', createApproach);
router.put('/:id', updateApproach);
router.delete('/:id', deleteApproach);
router.post('/:id/convert', convertToClient);

export default router;
