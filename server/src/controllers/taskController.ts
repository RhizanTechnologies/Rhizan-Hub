import { Response } from 'express';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';
import { createNotification } from '../utils/notificationHelper';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, project, assignedTo, dueDate, dateFilter, page, limit, pagination } = req.query;
    const filter: any = {};

    if (status && status !== 'ALL') filter.status = status;
    if (project && project !== 'ALL') filter.project = project;
    if (assignedTo && assignedTo !== 'ALL') filter.assignedTo = assignedTo;

    if (dueDate) {
      const start = new Date(dueDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dueDate as string);
      end.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: start, $lte: end };
    } else if (dateFilter) {
      const now = new Date();
      if (dateFilter === 'TODAY') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        filter.dueDate = { $gte: start, $lte: end };
      } else if (dateFilter === 'TOMORROW') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
        const end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);
        filter.dueDate = { $gte: start, $lte: end };
      } else if (dateFilter === 'THIS_WEEK') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59, 999);
        filter.dueDate = { $gte: start, $lte: end };
      } else if (dateFilter === 'OVERDUE') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        filter.dueDate = { $lt: startOfDay };
        filter.status = { $ne: 'DONE' };
      }
    }

    const shouldPaginate = page !== undefined || limit !== undefined || pagination === 'true';

    if (shouldPaginate) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .populate('assignedTo', 'name email title avatar')
          .populate('project', 'name clientName status')
          .populate('createdBy', 'name email')
          .populate('comments.author', 'name email avatar')
          .sort({ dueDate: 1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Task.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum) || 1;

      res.json({
        tasks,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      });
      return;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email title avatar')
      .populate('project', 'name clientName status')
      .populate('createdBy', 'name email')
      .populate('comments.author', 'name email avatar')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, assignedTo, project, priority, status, dueDate, estimatedHours, subtasks } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || undefined,
      project: project || undefined,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      dueDate,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      estimatedHours: estimatedHours || 0,
      createdBy: req.user?.id,
    });

    // Create activity
    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `created task`,
        entityType: 'TASK',
        entityTitle: task.title,
      });
    }

    // Trigger notification for assignee
    if (task.assignedTo && task.assignedTo.toString() !== req.user?.id) {
      await createNotification({
        recipient: task.assignedTo,
        actor: { id: req.user?.id, name: req.user?.name },
        type: 'TASK_ASSIGNED',
        title: `Task Assigned: ${task.title}`,
        message: `${req.user?.name || 'A teammate'} assigned "${task.title}" to you (${task.priority} priority).`,
        link: '/tasks',
        priority: task.priority === 'URGENT' ? 'urgent' : 'high',
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email title avatar')
      .populate('project', 'name clientName status');

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existingTask = await Task.findById(id);

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const oldStatus = existingTask.status;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true })
      .populate('assignedTo', 'name email title avatar')
      .populate('project', 'name clientName status')
      .populate('comments.author', 'name email avatar');

    // If status changed, log activity
    if (req.user && req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `moved task to ${req.body.status}`,
        entityType: 'TASK',
        entityTitle: updatedTask?.title || 'task',
      });
    }

    // Trigger notification on reassignment
    if (
      req.body.assignedTo &&
      req.body.assignedTo.toString() !== req.user?.id &&
      req.body.assignedTo.toString() !== existingTask.assignedTo?.toString()
    ) {
      await createNotification({
        recipient: req.body.assignedTo,
        actor: { id: req.user?.id, name: req.user?.name },
        type: 'TASK_ASSIGNED',
        title: `Task Assigned: ${updatedTask?.title || 'Task'}`,
        message: `${req.user?.name || 'A teammate'} assigned "${updatedTask?.title}" to you.`,
        link: '/tasks',
        priority: 'high',
      });
    }

    // Trigger notification if moved to REVIEW
    if (req.body.status === 'REVIEW' && oldStatus !== 'REVIEW') {
      const recipientId = existingTask.createdBy || (updatedTask?.project as any)?.lead;
      if (recipientId && recipientId.toString() !== req.user?.id) {
        await createNotification({
          recipient: recipientId,
          actor: { id: req.user?.id, name: req.user?.name },
          type: 'TASK_REVIEW',
          title: `Ready for QA/Review: ${updatedTask?.title}`,
          message: `${req.user?.name || 'A developer'} marked "${updatedTask?.title}" ready for QA/Review.`,
          link: '/tasks',
          priority: 'medium',
        });
      }
    }

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `deleted task`,
        entityType: 'TASK',
        entityTitle: task.title,
      });
    }

    res.json({ message: 'Task deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ message: 'Comment text is required' });
      return;
    }

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.comments.push({
      author: req.user?.id as any,
      text: text.trim(),
      createdAt: new Date(),
    });

    await task.save();

    // Trigger notification for assignee or task creator
    const notifyRecipient =
      task.assignedTo && task.assignedTo.toString() !== req.user?.id
        ? task.assignedTo
        : task.createdBy && task.createdBy.toString() !== req.user?.id
        ? task.createdBy
        : null;

    if (notifyRecipient) {
      await createNotification({
        recipient: notifyRecipient,
        actor: { id: req.user?.id, name: req.user?.name },
        type: 'TASK_COMMENT',
        title: `Comment on: ${task.title}`,
        message: `${req.user?.name || 'A teammate'}: "${text.trim().slice(0, 80)}${text.trim().length > 80 ? '...' : ''}"`,
        link: '/tasks',
        priority: 'medium',
      });
    }

    const populatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email title avatar')
      .populate('project', 'name clientName status')
      .populate('comments.author', 'name email avatar');

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};
