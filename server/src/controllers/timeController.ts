import { Response } from 'express';
import { TimeEntry } from '../models/TimeEntry';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { AuthRequest } from '../middlewares/auth';

export const getTimeEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, projectId, startDate, endDate } = req.query;
    const filter: any = {};

    if (userId && userId !== 'ALL') filter.user = userId;
    if (projectId && projectId !== 'ALL') filter.project = projectId;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const entries = await TimeEntry.find(filter)
      .populate('user', 'name email title avatar')
      .populate('project', 'name clientName')
      .populate('task', 'title')
      .sort({ date: -1, createdAt: -1 });

    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch time entries', error: error.message });
  }
};

export const logTime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, task, description, date, startTime, endTime, hours, minutes, billable, tag } = req.body;

    const totalHours = Number(hours) || 0;
    const totalMinutes = Number(minutes) || 0;

    const entry = await TimeEntry.create({
      user: req.user?.id,
      project,
      task: task || undefined,
      description: description || '',
      date: date ? new Date(date) : new Date(),
      startTime,
      endTime,
      hours: totalHours,
      minutes: totalMinutes,
      billable: billable !== undefined ? billable : true,
      tag: tag || 'Development',
    });

    if (task) {
      const addedHours = Math.round((totalHours + totalMinutes / 60) * 10) / 10;
      await Task.findByIdAndUpdate(task, {
        $inc: { actualHours: addedHours },
      });
    }

    const populated = await TimeEntry.findById(entry._id)
      .populate('user', 'name email title avatar')
      .populate('project', 'name clientName')
      .populate('task', 'title');

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to log time', error: error.message });
  }
};

export const updateTimeEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { project, task, description, date, startTime, endTime, hours, minutes, billable, tag } = req.body;

    const updated = await TimeEntry.findByIdAndUpdate(
      id,
      {
        project,
        task: task || undefined,
        description,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        hours: Number(hours) || 0,
        minutes: Number(minutes) || 0,
        billable: billable !== undefined ? billable : true,
        tag,
      },
      { new: true }
    )
      .populate('user', 'name email title avatar')
      .populate('project', 'name clientName')
      .populate('task', 'title');

    if (!updated) {
      res.status(404).json({ message: 'Time entry not found' });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update time entry', error: error.message });
  }
};

export const deleteTimeEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await TimeEntry.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Time entry not found' });
      return;
    }

    res.json({ message: 'Time entry deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete time entry', error: error.message });
  }
};

export const getWeeklySummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Current week start (Monday) and end
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const users = await User.find().select('name email title weeklyCapacityHours');
    const weeklyEntries = await TimeEntry.find({
      date: { $gte: startOfWeek, $lte: endOfWeek },
    }).populate('project', 'name');

    const summary = users.map((user) => {
      const userEntries = weeklyEntries.filter(
        (e) => e.user.toString() === user._id.toString()
      );
      const totalMinutes = userEntries.reduce(
        (sum, entry) => sum + (entry.hours * 60 + entry.minutes),
        0
      );
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

      // Group by project
      const projectMap: { [key: string]: number } = {};
      userEntries.forEach((entry: any) => {
        const pName = entry.project?.name || 'Other';
        const mins = entry.hours * 60 + entry.minutes;
        projectMap[pName] = (projectMap[pName] || 0) + mins;
      });

      const projectBreakdown = Object.entries(projectMap).map(([name, mins]) => ({
        projectName: name,
        hours: Math.round((mins / 60) * 10) / 10,
      }));

      return {
        user: {
          id: user._id,
          name: user.name,
          title: user.title,
          capacity: user.weeklyCapacityHours,
        },
        totalHours,
        projectBreakdown,
      };
    });

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to generate weekly summary', error: error.message });
  }
};
