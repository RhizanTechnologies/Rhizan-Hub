import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { evaluateDynamicAlerts } from '../utils/notificationHelper';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Refresh dynamic alert notifications (tasks due, outreach follow-ups, meetings, standup)
    await evaluateDynamicAlerts(userId);

    const { limit = '50', unreadOnly } = req.query;
    const filter: any = { recipient: userId };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10) || 50);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    await evaluateDynamicAlerts(userId);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({ count: unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({ notification, unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    await Notification.updateMany({ recipient: userId, read: false }, { read: true });

    res.json({ message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to mark all as read', error: error.message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const deleted = await Notification.findOneAndDelete({ _id: id, recipient: userId });

    if (!deleted) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

export const clearAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    await Notification.deleteMany({ recipient: userId, read: true });

    res.json({ message: 'Read notifications cleared' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to clear read notifications', error: error.message });
  }
};

export const getVapidPublicKey = async (_req: AuthRequest, res: Response): Promise<void> => {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY ||
    'BAhJGymbGd5kdlFAQvEMmyE7jD-p2iM0-ESP1EL7LFs3mkNUF17-hroR5IS5dyak_LBs4h8OZJBNkXt8QwRrBrE';
  res.json({ publicKey });
};

export const subscribePush = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      res.status(400).json({ message: 'Invalid push subscription payload' });
      return;
    }

    // Add subscription if not already present
    await User.findByIdAndUpdate(userId, {
      $pull: { pushSubscriptions: { endpoint: subscription.endpoint } },
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        pushSubscriptions: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
          createdAt: new Date(),
        },
      },
    });

    res.json({ message: 'Push subscription registered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to register push subscription', error: error.message });
  }
};

export const unsubscribePush = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { endpoint } = req.body;

    if (userId && endpoint) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint } },
      });
    }

    res.json({ message: 'Unsubscribed from push notifications' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to unsubscribe push', error: error.message });
  }
};

/**
 * Serverless Cron Handler (e.g. for Vercel Cron or external scheduler)
 * Evaluates tasks, outreach follow-ups, client meetings, standups, and capacity alerts for all active members
 */
export const evaluateAllAlerts = async (req: any, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured in Vercel environment variables, enforce authorization
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({ message: 'Unauthorized cron request' });
      return;
    }

    const activeUsers = await User.find({ status: 'ACTIVE' }, '_id');
    const evaluated: string[] = [];

    for (const u of activeUsers) {
      await evaluateDynamicAlerts(u._id.toString());
      evaluated.push(u._id.toString());
    }

    res.json({
      success: true,
      message: `Dynamic alerts evaluated successfully for ${evaluated.length} active users`,
      evaluatedUsersCount: evaluated.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error running cron dynamic alert evaluation:', error);
    res.status(500).json({ message: 'Cron evaluation failed', error: error.message });
  }
};
