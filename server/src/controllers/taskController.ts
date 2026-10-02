import { Response } from 'express';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, project, assignedTo, dueDate, dateFilter } = req.query;
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

    const populatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email title avatar')
      .populate('project', 'name clientName status')
      .populate('comments.author', 'name email avatar');

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};
