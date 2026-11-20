import { Response } from 'express';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Client } from '../models/Client';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';
import { createNotification, notifyUsers } from '../utils/notificationHelper';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find()
      .populate('lead', 'name email title avatar status')
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
      .populate('lead', 'name email title avatar status')
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
      lead,
      members,
      techStack,
      priority,
      status,
      deadline,
      budget,
      notes,
      links,
      milestones,
    } = req.body;

    let resolvedClientName = clientName || 'Internal';
    if (clientId) {
      const client = await Client.findById(clientId);
      if (client) {
        resolvedClientName = client.name;
      }
    }

    // Ensure lead is also included in members list if provided
    let resolvedMembers = Array.isArray(members) ? [...members] : [];
    if (lead && !resolvedMembers.some((m: any) => m.toString() === lead.toString())) {
      resolvedMembers.push(lead);
    }

    const project = await Project.create({
      name,
      clientName: resolvedClientName,
      clientId: clientId || undefined,
      description: description || '',
      lead: lead || undefined,
      members: resolvedMembers,
      techStack: Array.isArray(techStack) ? techStack : [],
      priority: priority || 'MEDIUM',
      status: status || 'IN_PROGRESS',
      deadline,
      budget,
      notes,
      links: links || [],
      milestones: milestones || [],
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

    try {
      if (project.lead && (!req.user || project.lead.toString() !== req.user.id)) {
        await createNotification({
          recipient: project.lead as any,
          actor: req.user ? { id: req.user.id, name: req.user.name } : undefined,
          type: 'PROJECT_ASSIGNED',
          title: `Project Lead: ${project.name}`,
          message: `${req.user?.name || 'Rhizan Hub'} assigned you as Project Lead for "${project.name}".`,
          link: `/projects/${project._id}`,
          priority: 'high',
          metadata: { projectId: project._id.toString() },
        });
      }

      const otherMembers = (project.members || []).filter(
        (m: any) =>
          m.toString() !== req.user?.id &&
          (!project.lead || m.toString() !== project.lead.toString())
      );

      for (const mId of otherMembers) {
        await createNotification({
          recipient: mId,
          actor: req.user ? { id: req.user.id, name: req.user.name } : undefined,
          type: 'PROJECT_ASSIGNED',
          title: `Assigned to Project: ${project.name}`,
          message: `${req.user?.name || 'Rhizan Hub'} added you to the project team for "${project.name}".`,
          link: `/projects/${project._id}`,
          priority: 'medium',
          metadata: { projectId: project._id.toString() },
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify project assignees:', notifErr);
    }

    const populated = await Project.findById(project._id)
      .populate('lead', 'name email title avatar')
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

    // Ensure lead is in members if both are passed
    if (req.body.lead && Array.isArray(req.body.members)) {
      if (!req.body.members.some((m: any) => m.toString() === req.body.lead.toString())) {
        req.body.members.push(req.body.lead);
      }
    }

    const project = await Project.findByIdAndUpdate(id, req.body, { new: true })
      .populate('lead', 'name email title avatar')
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

    try {
      // Check if new lead assigned
      const oldLeadId = existing.lead?.toString();
      const newLeadId = project?.lead?._id?.toString() || project?.lead?.toString();
      if (newLeadId && newLeadId !== oldLeadId && (!req.user || newLeadId !== req.user.id)) {
        await createNotification({
          recipient: newLeadId as any,
          actor: req.user ? { id: req.user.id, name: req.user.name } : undefined,
          type: 'PROJECT_ASSIGNED',
          title: `Assigned as Lead: ${project?.name}`,
          message: `${req.user?.name || 'Rhizan Hub'} assigned you as Project Lead for "${project?.name}".`,
          link: `/projects/${id}`,
          priority: 'high',
          metadata: { projectId: id },
        });
      }

      // Check if new members were added
      const oldMemberIds = new Set((existing.members || []).map((m: any) => m.toString()));
      const newMembers = (project?.members || []).filter((m: any) => {
        const mId = m?._id?.toString() || m?.toString();
        return mId && !oldMemberIds.has(mId) && (!req.user || mId !== req.user.id);
      });
      for (const newM of newMembers) {
        const mId = newM?._id?.toString() || newM?.toString();
        await createNotification({
          recipient: mId,
          actor: req.user ? { id: req.user.id, name: req.user.name } : undefined,
          type: 'PROJECT_ASSIGNED',
          title: `Added to Project: ${project?.name}`,
          message: `${req.user?.name || 'Rhizan Hub'} added you to the project team for "${project?.name}".`,
          link: `/projects/${id}`,
          priority: 'medium',
          metadata: { projectId: id },
        });
      }

      // Check if any milestone was newly completed
      if (req.body.milestones && Array.isArray(req.body.milestones)) {
        const oldMilestones = existing.milestones || [];
        for (const newMs of req.body.milestones) {
          if (newMs.status === 'COMPLETED') {
            const oldMs = oldMilestones.find(
              (m: any) => m.title === newMs.title || m._id?.toString() === newMs._id?.toString()
            );
            if (!oldMs || oldMs.status !== 'COMPLETED') {
              const targetRecipients = (project?.members || [])
                .map((m: any) => m?._id?.toString() || m?.toString())
                .filter((mId: string) => mId && (!req.user || mId !== req.user.id));

              await notifyUsers(targetRecipients, {
                actor: req.user ? { id: req.user.id, name: req.user.name } : undefined,
                type: 'MILESTONE_COMPLETED',
                title: `Milestone Completed: ${newMs.title}`,
                message: `Milestone "${newMs.title}" in project "${project?.name}" has been marked completed!`,
                link: `/projects/${id}`,
                priority: 'medium',
                metadata: { projectId: id },
              });
            }
          }
        }
      }
    } catch (notifErr) {
      console.error('Failed to process project notifications:', notifErr);
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

    // Unlink tasks connected to this project (prevent orphaned tasks)
    await Task.updateMany({ project: id }, { $unset: { project: 1 } });

    res.json({ message: 'Project deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
};
