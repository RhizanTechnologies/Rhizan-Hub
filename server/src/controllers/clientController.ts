import { Response } from 'express';
import { Client } from '../models/Client';
import { Project } from '../models/Project';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, assignedTo } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const clients = await Client.find(filter)
      .populate('assignedTo', 'name email title avatar')
      .populate('projects', 'name status progress deadline budget')
      .sort({ updatedAt: -1 });

    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch clients', error: error.message });
  }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id)
      .populate('assignedTo', 'name email title avatar')
      .populate('projects', 'name status progress deadline budget description members');

    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    res.json(client);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch client details', error: error.message });
  }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      contactPerson,
      phone,
      email,
      status,
      serviceInterested,
      assignedTo,
      lastContactDate,
      nextFollowUpDate,
      notes,
      dealValue,
      paidAmount,
      currency,
      projects,
      meetings,
      payments,
      links,
    } = req.body;

    const client = await Client.create({
      name: name?.trim(),
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      status: status || 'ACTIVE',
      serviceInterested: serviceInterested || 'Custom Software / ERP',
      assignedTo: assignedTo || req.user?.id,
      lastContactDate,
      nextFollowUpDate,
      notes: notes || '',
      dealValue: Number(dealValue) || 0,
      paidAmount: Number(paidAmount) || 0,
      currency: currency || 'USD',
      projects: projects || [],
      meetings: meetings || [],
      payments: payments || [],
      links: links || [],
    });

    // If projects were selected, link this client to those projects
    if (projects && Array.isArray(projects) && projects.length > 0) {
      await Project.updateMany(
        { _id: { $in: projects } },
        { clientId: client._id, clientName: client.name }
      );
    }

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `added new client account`,
        entityType: 'CLIENT',
        entityTitle: client.name,
      });
    }

    const populated = await Client.findById(client._id)
      .populate('assignedTo', 'name email title avatar')
      .populate('projects', 'name status progress deadline budget');

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create client', error: error.message });
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Client.findById(id);

    if (!existing) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    const oldStatus = existing.status;
    const updated = await Client.findByIdAndUpdate(id, req.body, { new: true })
      .populate('assignedTo', 'name email title avatar')
      .populate('projects', 'name status progress deadline budget');

    // If projects were updated, sync with Project collection
    if (req.body.projects && Array.isArray(req.body.projects)) {
      // Unlink any projects previously belonging to this client that are no longer in the list
      await Project.updateMany(
        { clientId: id, _id: { $nin: req.body.projects } },
        { $unset: { clientId: 1 } }
      );

      // Link new projects to this client
      await Project.updateMany(
        { _id: { $in: req.body.projects } },
        { clientId: id, clientName: updated?.name || existing.name }
      );
    }

    if (req.user && req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `updated status to ${req.body.status}`,
        entityType: 'CLIENT',
        entityTitle: updated?.name || 'Client',
      });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update client', error: error.message });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    // Unlink any projects connected to this client
    await Project.updateMany({ clientId: id }, { $unset: { clientId: 1 } });

    res.json({ message: 'Client deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete client', error: error.message });
  }
};
