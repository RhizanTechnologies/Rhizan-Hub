import { Router } from 'express';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
