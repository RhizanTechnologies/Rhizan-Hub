import { Router } from 'express';
import {
  getApproaches,
  getApproachById,
  createApproach,
  updateApproach,
  deleteApproach,
  convertToClient,
  addContactHistory,
} from '../controllers/approachController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getApproaches);
router.post('/', createApproach);
router.get('/:id', getApproachById);
router.put('/:id', updateApproach);
router.delete('/:id', deleteApproach);
router.post('/:id/contact', addContactHistory);
router.post('/:id/convert', convertToClient);

export default router;
