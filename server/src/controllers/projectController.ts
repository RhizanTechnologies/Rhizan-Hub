import { Response } from 'express';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Client } from '../models/Client';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find()
      .populate('members', 'name email title avatar status')
      .populate('clientId', 'name contactPerson email phone status')
      .sort({ updatedAt: -1 });

    // Attach task counts to each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: 'DONE',
        });
        const calculatedProgress =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress || 0;

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress: calculatedProgress,
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('members', 'name email title avatar status')
      .populate('clientId', 'name contactPerson email phone status');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const tasks = await Task.find({ project: id })
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ project, tasks });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch project details', error: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      clientName,
      clientId,
      description,
      members,
      status,
      deadline,
      budget,
      notes,
      links,
    } = req.body;

    let resolvedClientName = clientName || 'Internal';
    if (clientId) {
      const client = await Client.findById(clientId);
      if (client) {
        resolvedClientName = client.name;
      }
    }

    const project = await Project.create({
      name,
      clientName: resolvedClientName,
      clientId: clientId || undefined,
      description: description || '',
      members: members || [],
      status: status || 'IN_PROGRESS',
      deadline,
      budget,
      notes,
      links: links || [],
    });

    if (clientId) {
      await Client.findByIdAndUpdate(clientId, {
        $addToSet: { projects: project._id },
      });
    }

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: 'created project',
        entityType: 'PROJECT',
        entityTitle: project.name,
      });
    }

    const populated = await Project.findById(project._id)
      .populate('members', 'name email title avatar')
      .populate('clientId', 'name contactPerson email phone status');

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Project.findById(id);

    if (!existing) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // If client link changed
    if (req.body.clientId && req.body.clientId !== existing.clientId?.toString()) {
      if (existing.clientId) {
        await Client.findByIdAndUpdate(existing.clientId, {
          $pull: { projects: id },
        });
      }
      await Client.findByIdAndUpdate(req.body.clientId, {
        $addToSet: { projects: id },
      });

      const newClient = await Client.findById(req.body.clientId);
      if (newClient) {
        req.body.clientName = newClient.name;
      }
    }

    const project = await Project.findByIdAndUpdate(id, req.body, { new: true })
      .populate('members', 'name email title avatar')
      .populate('clientId', 'name contactPerson email phone status');

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: 'updated project',
        entityType: 'PROJECT',
        entityTitle: project?.name || 'Project',
      });
    }

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Unlink from Client
    await Client.updateMany({ projects: id }, { $pull: { projects: id } });

    res.json({ message: 'Project deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
};
