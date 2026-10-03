import { Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Client } from '../models/Client';
import { User } from '../models/User';
import { TimeEntry } from '../models/TimeEntry';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    // 1. Task counts
    const totalTasks = await Task.countDocuments();
    const tasksDueToday = await Task.countDocuments({
      status: { $ne: 'DONE' },
      dueDate: { $gte: todayStart, $lte: todayEnd },
    });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: 'DONE' },
      dueDate: { $lt: todayStart },
    });

    // 2. Active Projects with progress
    const projects = await Project.find({ status: { $ne: 'COMPLETED' } })
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(5);

    const activeProjects = await Promise.all(
      projects.map(async (project) => {
        const total = await Task.countDocuments({ project: project._id });
        const done = await Task.countDocuments({
          project: project._id,
          status: 'DONE',
        });
        const progress = total > 0 ? Math.round((done / total) * 100) : project.progress || 0;
        return {
          id: project._id,
          name: project.name,
          clientName: project.clientName,
          progress,
          totalTasks: total,
          status: project.status,
          deadline: project.deadline,
        };
      })
    );

    // 3. Clients & Team Counts
    const activeClientsCount = await Client.countDocuments({ status: { $ne: 'COMPLETED' } });
    const teamMembersCount = await User.countDocuments();

    // 4. Hours worked this week
    const weeklyEntries = await TimeEntry.find({ date: { $gte: startOfWeek } });
    const totalWeeklyMinutes = weeklyEntries.reduce(
      (sum, e) => sum + (e.hours * 60 + e.minutes),
      0
    );
    const hoursThisWeek = Math.round((totalWeeklyMinutes / 60) * 10) / 10;

    // 4b. Today's Time Tracking
    const todayEntries = await TimeEntry.find({
      date: { $gte: todayStart, $lte: todayEnd },
    })
      .populate('project', 'name clientName')
      .populate('task', 'title')
      .populate('user', 'name avatar email');

    let myTodayEntries: any[] = [];
    if (req.user?.id) {
      myTodayEntries = todayEntries.filter(
        (e) =>
          e.user &&
          (e.user._id?.toString() === req.user?.id ||
            (e.user as any).id === req.user?.id ||
            (typeof e.user === 'string' && e.user === req.user?.id))
      );
    }
    const myTodayTotalMinutes = myTodayEntries.reduce(
      (sum, e) => sum + (e.hours * 60 + e.minutes),
      0
    );
    const myTodayHours = Math.round((myTodayTotalMinutes / 60) * 10) / 10;

    const teamTodayTotalMinutes = todayEntries.reduce(
      (sum, e) => sum + (e.hours * 60 + e.minutes),
      0
    );
    const teamTodayHours = Math.round((teamTodayTotalMinutes / 60) * 10) / 10;

    // Team weekly members breakdown (48h capacity)
    const allUsers = await User.find({ status: { $ne: 'INACTIVE' } }).select('name role title avatar');
    const teamWeeklyBreakdown = allUsers.map((member) => {
      const memberWeekly = weeklyEntries.filter(
        (e) => e.user && e.user.toString() === member._id.toString()
      );
      const mMinutes = memberWeekly.reduce((sum, e) => sum + (e.hours * 60 + e.minutes), 0);
      const mHours = Math.round((mMinutes / 60) * 10) / 10;
      return {
        id: member._id,
        name: member.name,
        role: member.title || member.role || 'Member',
        hours: mHours,
        capacity: 48,
        percentage: Math.min(100, Math.round((mHours / 48) * 100)),
      };
    });

    // 5. Logged-in user's tasks ("My Tasks")
    let myTasks: any[] = [];
    if (req.user?.id) {
      myTasks = await Task.find({
        assignedTo: req.user.id,
        status: { $ne: 'DONE' },
      })
        .populate('project', 'name')
        .sort({ dueDate: 1, priority: -1 })
        .limit(6);
    }

    // 6. Recent Activity Feed
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(8);

    // 7. Upcoming Deadlines
    const upcomingDeadlines = await Task.find({
      status: { $ne: 'DONE' },
      dueDate: { $gte: todayStart },
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 })
      .limit(5);

    res.json({
      stats: {
        totalTasks,
        tasksDueToday,
        overdueTasks,
        activeProjectsCount: activeProjects.length,
        activeClientsCount,
        teamMembersCount,
        hoursThisWeek,
        myHoursToday: myTodayHours,
        teamHoursToday: teamTodayHours,
        dailyTargetHours: 8,
      },
      todayTimeTracking: {
        myHoursToday: myTodayHours,
        myMinutesToday: myTodayTotalMinutes,
        myEntriesToday: myTodayEntries,
        teamHoursToday: teamTodayHours,
        dailyTargetHours: 8,
        percentage: Math.min(100, Math.round((myTodayHours / 8) * 100)),
      },
      teamWeeklyBreakdown,
      activeProjects,
      myTasks,
      recentActivities,
      upcomingDeadlines,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: error.message });
  }
};
