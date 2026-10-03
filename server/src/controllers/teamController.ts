import { Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { TimeEntry } from '../models/TimeEntry';
import { Approach } from '../models/Approach';
import { AuthRequest } from '../middlewares/auth';

export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: 1 });

    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

    const teamData = await Promise.all(
      users.map(async (user) => {
        // Find tasks assigned to this user that are not DONE
        const activeTasks = await Task.find({
          assignedTo: user._id,
          status: { $ne: 'DONE' },
        }).populate('project', 'name');

        // Find projects where member is assigned or is lead
        const memberProjects = await Project.find({
          $or: [{ members: user._id }, { lead: user._id }],
          status: { $in: ['IN_PROGRESS', 'PLANNING'] },
        }).select('_id name status clientName');

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
          weeklyCapacityHours: user.weeklyCapacityHours === 40 ? 48 : (user.weeklyCapacityHours || 48),
          activeTaskCount: activeTasks.length,
          tasks: activeTasks.map((t) => ({
            id: t._id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            projectName: (t.project as any)?.name || 'General',
          })),
          activeProjects: memberProjects.map((p) => ({
            id: p._id,
            name: p.name,
            status: p.status,
            clientName: p.clientName,
          })),
          thisWeekHours,
        };
      })
    );

    res.json(teamData);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch team data', error: error.message });
  }
};

export const getTeamMemberDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    // Current week calculation
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

    // 1. Projects
    const projects = await Project.find({
      $or: [{ members: user._id }, { lead: user._id }],
    })
      .select('name description status priority deadline clientName budget lead techStack')
      .populate('lead', 'name email');

    // 2. Tasks
    const tasks = await Task.find({ assignedTo: user._id })
      .populate('project', 'name clientName')
      .sort({ updatedAt: -1 });

    // 3. Time Entries (Recent 30 entries & current week)
    const timeEntries = await TimeEntry.find({ user: user._id })
      .populate('project', 'name clientName')
      .populate('task', 'title')
      .sort({ date: -1, createdAt: -1 })
      .limit(30);

    const weeklyEntries = await TimeEntry.find({
      user: user._id,
      date: { $gte: startOfWeek },
    });

    const totalMinutesThisWeek = weeklyEntries.reduce(
      (sum, entry) => sum + (entry.hours * 60 + entry.minutes),
      0
    );
    const thisWeekHours = Math.round((totalMinutesThisWeek / 60) * 10) / 10;

    const allTimeMinutes = await TimeEntry.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: { $add: [{ $multiply: ['$hours', 60] }, '$minutes'] } } } },
    ]);
    const allTimeHours = allTimeMinutes.length > 0 ? Math.round((allTimeMinutes[0].total / 60) * 10) / 10 : 0;

    // 4. Outreach / Approaches assigned to this member
    const approaches = await Approach.find({ assignedTo: user._id })
      .select('businessName contactPerson email phone status niche location lastContactDate nextFollowUpDate')
      .sort({ updatedAt: -1 });

    const capacity = user.weeklyCapacityHours === 40 ? 48 : (user.weeklyCapacityHours || 48);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        status: user.status,
        weeklyCapacityHours: capacity,
        createdAt: user.createdAt,
      },
      stats: {
        thisWeekHours,
        allTimeHours,
        capacity,
        capacityPercent: Math.min(100, Math.round((thisWeekHours / capacity) * 100)),
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((t) => t.status !== 'DONE').length,
        completedTasks: tasks.filter((t) => t.status === 'DONE').length,
        activeProjectsCount: projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length,
        assignedApproachesCount: approaches.length,
      },
      projects,
      tasks,
      timeEntries,
      approaches,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch team member details', error: error.message });
  }
};

export const updateTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, title, weeklyCapacityHours, status } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(role && { role }),
        ...(title && { title: title.trim() }),
        ...(weeklyCapacityHours !== undefined && { weeklyCapacityHours: Number(weeklyCapacityHours) || 48 }),
        ...(status && { status }),
      },
      { new: true }
    ).select('-password');

    if (!updated) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update team member', error: error.message });
  }
};
