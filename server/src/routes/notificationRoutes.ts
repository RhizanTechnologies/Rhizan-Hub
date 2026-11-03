import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
} from '../controllers/notificationController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/vapid-key', getVapidPublicKey);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.delete('/clear-read', clearAllRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllRead);

export default router;
