import { Response } from 'express';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { TimeEntry } from '../models/TimeEntry';
import { AuthRequest } from '../middlewares/auth';

export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: 1 });

    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    const teamData = await Promise.all(
      users.map(async (user) => {
        // Find tasks assigned to this user that are not DONE
        const activeTasks = await Task.find({
          assignedTo: user._id,
          status: { $ne: 'DONE' },
        }).populate('project', 'name');

        // Find primary active project
        const memberProjects = await Project.find({
          members: user._id,
          status: 'IN_PROGRESS',
        }).select('name');

        // Calculate hours worked this week
        const weeklyEntries = await TimeEntry.find({
          user: user._id,
          date: { $gte: startOfWeek },
        });

        const totalMinutes = weeklyEntries.reduce(
          (sum, entry) => sum + (entry.hours * 60 + entry.minutes),
          0
        );
        const thisWeekHours = Math.round((totalMinutes / 60) * 10) / 10;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          status: user.status,
          weeklyCapacityHours: user.weeklyCapacityHours,
          activeTaskCount: activeTasks.length,
          tasks: activeTasks.slice(0, 5).map((t) => ({
            id: t._id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            projectName: (t.project as any)?.name || 'General',
          })),
          activeProjects: memberProjects.map((p) => p.name),
          thisWeekHours,
        };
      })
    );

    res.json(teamData);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch team data', error: error.message });
  }
};
