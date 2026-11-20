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
  evaluateAllAlerts,
} from '../controllers/notificationController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Serverless Cron & external alert evaluation endpoint (protected by CRON_SECRET if configured)
router.get('/evaluate', evaluateAllAlerts);
router.post('/evaluate', evaluateAllAlerts);

router.use(authenticateToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/vapid-key', getVapidPublicKey);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/clear-read', clearAllRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllRead);

export default router;
