import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
} from '../controllers/notificationController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllRead);

export default router;
