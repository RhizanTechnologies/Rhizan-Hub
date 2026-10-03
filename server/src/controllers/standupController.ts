import { Response } from 'express';
import { Standup } from '../models/Standup';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';

export const getTodayStandups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const standups = await Standup.find({
      date: { $gte: todayStart, $lte: todayEnd },
    })
      .populate('user', 'name email title role avatar')
      .sort({ createdAt: -1 });

    const myStandup = req.user?.id
      ? standups.find((s) => s.user && ((s.user as any)._id?.toString() === req.user?.id || (s.user as any).id === req.user?.id))
      : null;

    res.json({
      standups,
      myStandup,
      submittedCount: standups.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch standups', error: error.message });
  }
};

export const submitStandup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { completedToday, prioritiesTomorrow, blockers, hoursWorked } = req.body;
    if (!completedToday || !prioritiesTomorrow) {
      res.status(400).json({ message: 'Completed work and priorities are required.' });
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const userObj = await User.findById(req.user?.id);
    const userName = userObj?.name || req.user?.email || 'Team Member';
    const userRole = userObj?.title || userObj?.role || 'Member';
    const userAvatar = userObj?.avatar;

    // Check if user already submitted today
    let standup = await Standup.findOne({
      user: req.user?.id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (standup) {
      standup.completedToday = completedToday;
      standup.prioritiesTomorrow = prioritiesTomorrow;
      standup.blockers = blockers || '';
      standup.hoursWorked = Number(hoursWorked) || standup.hoursWorked;
      await standup.save();
    } else {
      standup = await Standup.create({
        user: req.user?.id,
        userName,
        userRole,
        userAvatar,
        date: new Date(),
        completedToday,
        prioritiesTomorrow,
        blockers: blockers || '',
        hoursWorked: Number(hoursWorked) || 0,
      });

      // Log activity
      await Activity.create({
        user: req.user?.id,
        userName,
        action: 'shared Daily EOD Summary',
        entityType: 'TASK',
        entityTitle: 'Daily Standup Wrap-Up',
      });
    }

    res.status(200).json(standup);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit standup', error: error.message });
  }
};
