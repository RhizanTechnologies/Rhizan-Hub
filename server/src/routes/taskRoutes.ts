import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment,
} from '../controllers/taskController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);

export default router;
