import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Notification } from '../models/Notification';
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
