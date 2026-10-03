import { Response } from 'express';
import { TimeEntry } from '../models/TimeEntry';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { Approach } from '../models/Approach';
import { AuthRequest } from '../middlewares/auth';

export const getWeeklyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);

      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const weekLabel = `${startStr} – ${endStr}`;

    // 1. Time Entries in this week
    const entries = await TimeEntry.find({
      date: { $gte: start, $lte: end },
    })
      .populate('user', 'name email title role avatar')
      .populate('project', 'name clientName')
      .populate('task', 'title');

    let totalTeamMinutes = 0;
    let billableMinutes = 0;
    let nonBillableMinutes = 0;

    entries.forEach((e) => {
      const mins = (e.hours || 0) * 60 + (e.minutes || 0);
      totalTeamMinutes += mins;
      if (e.billable) billableMinutes += mins;
      else nonBillableMinutes += mins;
    });

    const totalTeamHours = Math.round((totalTeamMinutes / 60) * 10) / 10;
    const billableHours = Math.round((billableMinutes / 60) * 10) / 10;
    const nonBillableHours = Math.round((nonBillableMinutes / 60) * 10) / 10;
    const billablePercentage =
      totalTeamHours > 0 ? Math.round((billableHours / totalTeamHours) * 100) : 0;

    // 2. Active Team Members & 48h capacity breakdown
    const allUsers = await User.find({ status: { $ne: 'INACTIVE' } }).select(
      'name email title role avatar'
    );
    const expectedCapacityTotal = allUsers.length * 48; // 48h per member

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const teamPerformance = allUsers.map((member) => {
      const memberEntries = entries.filter(
        (e) => e.user && (e.user._id?.toString() === member._id.toString() || (e.user as any).id === member._id.toString())
      );

      let memberTotalMins = 0;
      let memberBillableMins = 0;

      // Calculate 7-day breakdown (Mon-Sun)
      const dailyHours: { day: string; date: string; hours: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dStr = d.toISOString().split('T')[0];

        const dEntries = memberEntries.filter((e) => {
          const entryDate = new Date(e.date).toISOString().split('T')[0];
          return entryDate === dStr;
        });

        const dMins = dEntries.reduce((sum, e) => sum + (e.hours * 60 + e.minutes), 0);
        dailyHours.push({
          day: dayNames[i],
          date: dStr,
          hours: Math.round((dMins / 60) * 10) / 10,
        });
      }

      memberEntries.forEach((e) => {
        const mins = (e.hours || 0) * 60 + (e.minutes || 0);
        memberTotalMins += mins;
        if (e.billable) memberBillableMins += mins;
      });

      const hoursLogged = Math.round((memberTotalMins / 60) * 10) / 10;
      const memBillableHours = Math.round((memberBillableMins / 60) * 10) / 10;
      const targetHours = 48;
      const utilizationPercent = Math.min(100, Math.round((hoursLogged / targetHours) * 100));

      // Project breakdown for member
      const projMap = new Map<string, number>();
      memberEntries.forEach((e) => {
        const pName = (e.project as any)?.name || 'General';
        const mins = (e.hours || 0) * 60 + (e.minutes || 0);
        projMap.set(pName, (projMap.get(pName) || 0) + mins);
      });

      const topProjects = Array.from(projMap.entries()).map(([name, mins]) => ({
        name,
        hours: Math.round((mins / 60) * 10) / 10,
      }));

      return {
        id: member._id,
        name: member.name,
        role: member.title || member.role || 'Member',
        avatar: member.avatar,
        hoursLogged,
        targetHours,
        utilizationPercent,
        billableHours: memBillableHours,
        dailyHours,
        topProjects,
      };
    });

    // 3. Projects Deliverables Breakdown
    const activeProjects = await Project.find({ status: { $ne: 'COMPLETED' } })
      .populate('members', 'name role avatar')
      .sort({ updatedAt: -1 });

    const projectDeliverables = await Promise.all(
      activeProjects.map(async (p) => {
        const pEntries = entries.filter(
          (e) => e.project && (e.project._id?.toString() === p._id.toString() || (e.project as any).id === p._id.toString())
        );
        const pMins = pEntries.reduce((sum, e) => sum + (e.hours * 60 + e.minutes), 0);
        const weeklyHours = Math.round((pMins / 60) * 10) / 10;

        const totalTasks = await Task.countDocuments({ project: p._id });
        const doneTasks = await Task.countDocuments({ project: p._id, status: 'DONE' });
        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : p.progress || 0;

        // Tasks finished for this project this week
        const completedThisWeek = await Task.find({
          project: p._id,
          status: 'DONE',
          updatedAt: { $gte: start, $lte: end },
        }).select('title priority assignedTo');

        const inProgressTasks = await Task.find({
          project: p._id,
          status: 'IN_PROGRESS',
        }).select('title priority assignedTo');

        return {
          id: p._id,
          name: p.name,
          clientName: p.clientName || 'Internal',
          status: p.status,
          progress,
          weeklyHours,
          totalTasks,
          doneTasks,
          completedThisWeek,
          inProgressTasks,
          deadline: p.deadline,
        };
      })
    );

    // 4. Tasks Completed this week across workspace
    const completedTasksThisWeek = await Task.find({
      status: 'DONE',
      updatedAt: { $gte: start, $lte: end },
    })
      .populate('project', 'name clientName')
      .populate('assignedTo', 'name avatar')
      .sort({ updatedAt: -1 });

    // 5. Tasks Planned for Next Week (High & Urgent priority, not done)
    const nextWeekStart = new Date(end);
    nextWeekStart.setDate(end.getDate() + 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 7);

    const plannedNextWeek = await Task.find({
      status: { $ne: 'DONE' },
      $or: [
        { priority: { $in: ['URGENT', 'HIGH'] } },
        { dueDate: { $gte: nextWeekStart, $lte: nextWeekEnd } },
      ],
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .sort({ priority: 1, dueDate: 1 })
      .limit(8);

    // 6. Overdue / At-Risk Items
    const overdueTasks = await Task.find({
      status: { $ne: 'DONE' },
      dueDate: { $lt: new Date() },
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .limit(6);

    // 7. Business Outreach & Leads
    const newApproachesThisWeek = await Approach.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });
    const dealsWonThisWeek = await Approach.countDocuments({
      status: 'DEAL_WON',
      updatedAt: { $gte: start, $lte: end },
    });
    const totalActiveApproaches = await Approach.countDocuments({
      status: { $nin: ['DEAL_WON', 'NOT_INTERESTED'] },
    });

    const recentApproaches = await Approach.find({
      $or: [
        { updatedAt: { $gte: start, $lte: end } },
        { createdAt: { $gte: start, $lte: end } },
      ],
    })
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      weekRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        label: weekLabel,
      },
      summary: {
        totalTeamHours,
        expectedCapacityTotal,
        capacityUtilization:
          expectedCapacityTotal > 0
            ? Math.min(100, Math.round((totalTeamHours / expectedCapacityTotal) * 100))
            : 0,
        billableHours,
        nonBillableHours,
        billablePercentage,
        tasksCompletedCount: completedTasksThisWeek.length,
        activeProjectsCount: activeProjects.length,
        newApproachesCount: newApproachesThisWeek,
        dealsWonCount: dealsWonThisWeek,
        overdueCount: overdueTasks.length,
      },
      teamPerformance,
      projectDeliverables,
      completedTasksThisWeek,
      plannedNextWeek,
      overdueTasks,
      businessDevelopment: {
        newApproachesCount: newApproachesThisWeek,
        dealsWonCount: dealsWonThisWeek,
        totalActiveApproaches,
        recentApproaches,
      },
    });
  } catch (error: any) {
    console.error('Failed to generate weekly report:', error);
    res.status(500).json({ message: 'Failed to generate weekly report', error: error.message });
  }
};
