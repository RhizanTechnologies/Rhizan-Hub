import { Types } from 'mongoose';
import { Notification, NotificationType, NotificationPriority } from '../models/Notification';
import { Task } from '../models/Task';
import { Approach } from '../models/Approach';
import { Project } from '../models/Project';
import { Client } from '../models/Client';
import { Standup } from '../models/Standup';
import { TimeEntry } from '../models/TimeEntry';
import { User } from '../models/User';

export interface CreateNotificationParams {
  recipient: Types.ObjectId | string;
  actor?: {
    id?: Types.ObjectId | string;
    name?: string;
  };
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  dedupKey?: string;
}

/**
 * Creates a notification if not duplicated by dedupKey
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const {
      recipient,
      actor,
      type,
      title,
      message,
      link = '/',
      priority = 'medium',
      metadata = {},
      dedupKey,
    } = params;

    if (dedupKey) {
      // Check if already created with this dedup key within the past 16 hours
      const cutoff = new Date(Date.now() - 16 * 60 * 60 * 1000);
      const existing = await Notification.findOne({
        recipient,
        dedupKey,
        createdAt: { $gte: cutoff },
      });
      if (existing) {
        return existing;
      }
    }

    return await Notification.create({
      recipient,
      actor: actor
        ? {
            id: actor.id ? new Types.ObjectId(actor.id.toString()) : undefined,
            name: actor.name,
          }
        : undefined,
      type,
      title,
      message,
      link,
      priority,
      metadata,
      dedupKey,
      read: false,
    });
  } catch (err: any) {
    console.error('Error creating notification:', err);
    return null;
  }
}

/**
 * Broadcasts notification to multiple users
 */
export async function notifyUsers(
  recipientIds: (Types.ObjectId | string)[],
  params: Omit<CreateNotificationParams, 'recipient'>
) {
  const promises = recipientIds.map((rId) =>
    createNotification({
      ...params,
      recipient: rId,
    })
  );
  return Promise.all(promises);
}

/**
 * Evaluates real-time dynamic alerts for the logged-in user:
 * - Tasks due today or overdue
 * - Outreach follow-ups due today or overdue
 * - Project deadlines approaching (<= 3 days)
 * - Client meetings scheduled for today
 * - Daily standup reminder (if after 16:00 and unsubmitted)
 * - Weekly capacity target (48h logged)
 */
export async function evaluateDynamicAlerts(userId: string) {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const userObjectId = new Types.ObjectId(userId);

    // 1. Outreach follow-ups assigned to user
    const approaches = await Approach.find({
      assignedTo: userObjectId,
      status: { $nin: ['DEAL_WON', 'NOT_INTERESTED'] },
      nextFollowUpDate: { $exists: true, $ne: null },
    });

    for (const appr of approaches) {
      if (!appr.nextFollowUpDate) continue;
      const followUpDate = new Date(appr.nextFollowUpDate);
      const fDateStr = followUpDate.toISOString().split('T')[0];
      const isOverdue = fDateStr < todayStr;
      const isToday = fDateStr === todayStr;

      if (isToday) {
        await createNotification({
          recipient: userObjectId,
          type: 'OUTREACH_FOLLOWUP',
          title: `Follow-up Today: ${appr.businessName}`,
          message: `Scheduled follow-up contact is due today with ${appr.contactPerson || appr.businessName} (${appr.niche || 'Lead'}).`,
          link: `/approaches/${appr._id}`,
          priority: 'high',
          dedupKey: `outreach-today-${appr._id}-${todayStr}`,
        });
      } else if (isOverdue) {
        await createNotification({
          recipient: userObjectId,
          type: 'OUTREACH_FOLLOWUP',
          title: `⚠️ Overdue Follow-up: ${appr.businessName}`,
          message: `Follow-up was scheduled for ${followUpDate.toLocaleDateString()}. Please log contact or reschedule.`,
          link: `/approaches/${appr._id}`,
          priority: 'urgent',
          dedupKey: `outreach-overdue-${appr._id}-${todayStr}`,
        });
      }
    }

    // 2. Personal Tasks due today or overdue
    const tasks = await Task.find({
      assignedTo: userObjectId,
      status: { $ne: 'DONE' },
      dueDate: { $exists: true, $ne: null },
    }).populate('project', 'name');

    for (const task of tasks) {
      if (!task.dueDate) continue;
      const dueDate = new Date(task.dueDate);
      const dDateStr = dueDate.toISOString().split('T')[0];
      const isOverdue = dDateStr < todayStr;
      const isToday = dDateStr === todayStr;
      const projName = (task.project as any)?.name || 'Personal';

      if (isToday) {
        await createNotification({
          recipient: userObjectId,
          type: 'TASK_DUE',
          title: `Task Due Today: ${task.title}`,
          message: `Your task on "${projName}" is due today. Priority: ${task.priority}.`,
          link: `/tasks`,
          priority: task.priority === 'URGENT' ? 'urgent' : 'high',
          dedupKey: `task-today-${task._id}-${todayStr}`,
        });
      } else if (isOverdue) {
        await createNotification({
          recipient: userObjectId,
          type: 'TASK_DUE',
          title: `⚠️ Overdue Task: ${task.title}`,
          message: `Deadline was ${dueDate.toLocaleDateString()}. Please update status or mark completed.`,
          link: `/tasks`,
          priority: 'urgent',
          dedupKey: `task-overdue-${task._id}-${todayStr}`,
        });
      }
    }

    // 3. Projects deadline approaching (within 3 days)
    const projects = await Project.find({
      $or: [{ lead: userObjectId }, { members: userObjectId }],
      status: { $nin: ['COMPLETED', 'ON_HOLD'] },
      deadline: { $exists: true, $ne: null },
    });

    for (const proj of projects) {
      if (!proj.deadline) continue;
      const dlDate = new Date(proj.deadline);
      const diffTime = dlDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3 && (proj.progress || 0) < 100) {
        await createNotification({
          recipient: userObjectId,
          type: 'PROJECT_DEADLINE',
          title: `Project Deadline Approaching: ${proj.name}`,
          message: `${proj.name} is due in ${diffDays === 0 ? 'today' : `${diffDays} day(s)`}. Current progress: ${proj.progress || 0}%.`,
          link: `/projects/${proj._id}`,
          priority: diffDays <= 1 ? 'urgent' : 'high',
          dedupKey: `proj-deadline-${proj._id}-${todayStr}`,
        });
      }
    }

    // 4. Client meetings scheduled for today
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const clientsWithMeetings = await Client.find({
      'meetings.date': { $gte: startOfToday, $lte: endOfToday },
      'meetings.status': 'SCHEDULED',
    });

    for (const c of clientsWithMeetings) {
      const todayMeetings = (c.meetings || []).filter(
        (m) =>
          m.status === 'SCHEDULED' &&
          m.date &&
          new Date(m.date) >= startOfToday &&
          new Date(m.date) <= endOfToday
      );
      for (const m of todayMeetings) {
        await createNotification({
          recipient: userObjectId,
          type: 'CLIENT_MEETING',
          title: `Client Meeting Today: ${m.title}`,
          message: `Scheduled with ${c.name} at ${m.time || 'agreed time'}. Location: ${m.linkOrLocation || 'Online'}`,
          link: `/clients/${c._id}`,
          priority: 'high',
          dedupKey: `meeting-${c._id}-${m.title}-${todayStr}`,
        });
      }
    }

    // 5. Daily EOD Standup reminder (after 16:00 / 4 PM)
    const currentHour = today.getHours();
    if (currentHour >= 16) {
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      const standup = await Standup.findOne({
        user: userObjectId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!standup) {
        await createNotification({
          recipient: userObjectId,
          type: 'STANDUP_REMINDER',
          title: 'Daily EOD Standup Reminder',
          message: "It's time to submit your daily standup! Share what you completed and priorities for tomorrow.",
          link: '/',
          priority: 'high',
          dedupKey: `standup-reminder-${userId}-${todayStr}`,
        });
      }
    }

    // 6. Weekly Capacity Target Alert (48h target)
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const timeEntriesThisWeek = await TimeEntry.find({
      user: userObjectId,
      date: { $gte: monday },
    });

    const totalHoursLogged = timeEntriesThisWeek.reduce(
      (sum, e) => sum + (e.hours || 0) + (e.minutes || 0) / 60,
      0
    );

    if (totalHoursLogged >= 48) {
      await createNotification({
        recipient: userObjectId,
        type: 'CAPACITY_ALERT',
        title: 'Weekly Target Reached: 48h Logged! 🎉',
        message: `Great work! You have logged ${Math.round(totalHoursLogged)}h this week, achieving Rhizan's 48h weekly sprint baseline.`,
        link: '/time',
        priority: 'medium',
        dedupKey: `capacity-48h-${userId}-${monday.toISOString().split('T')[0]}`,
      });
    }
  } catch (err: any) {
    console.error('Error evaluating dynamic alerts:', err);
  }
}
