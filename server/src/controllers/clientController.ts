import { Response } from 'express';
import { Client } from '../models/Client';
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
      .sort({ updatedAt: -1 });

    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch clients', error: error.message });
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
    } = req.body;

    const client = await Client.create({
      name,
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      status: status || 'LEAD',
      serviceInterested: serviceInterested || 'Custom Software / ERP',
      assignedTo: assignedTo || req.user?.id,
      lastContactDate,
      nextFollowUpDate,
      notes: notes || '',
      dealValue: dealValue || 0,
    });

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `added new lead / client`,
        entityType: 'CLIENT',
        entityTitle: client.name,
      });
    }

    const populated = await Client.findById(client._id).populate(
      'assignedTo',
      'name email title avatar'
    );

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
    const updated = await Client.findByIdAndUpdate(id, req.body, { new: true }).populate(
      'assignedTo',
      'name email title avatar'
    );

    if (req.user && req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `moved pipeline stage to ${req.body.status}`,
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

    res.json({ message: 'Client deleted', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete client', error: error.message });
  }
};
