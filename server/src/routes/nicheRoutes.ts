import { Router } from 'express';
import {
  getNiches,
  createNiche,
  updateNiche,
  deleteNiche,
} from '../controllers/nicheController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getNiches);
router.post('/', createNiche);
router.put('/:id', updateNiche);
router.delete('/:id', deleteNiche);

export default router;
