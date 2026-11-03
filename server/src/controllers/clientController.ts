import { Response } from 'express';
import { Client } from '../models/Client';
import { Project } from '../models/Project';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { createNotification, notifyUsers } from '../utils/notificationHelper';

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
      .populate({
        path: 'projects',
        populate: { path: 'lead', select: 'name email title avatar' },
      });

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
      .populate({
        path: 'projects',
        populate: { path: 'lead', select: 'name email title avatar' },
      });

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
      .populate({
        path: 'projects',
        populate: { path: 'lead', select: 'name email title avatar' },
      });

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

    // Trigger notification if a new meeting was scheduled
    if (req.body.meetings && Array.isArray(req.body.meetings)) {
      const oldMeetingsCount = existing.meetings?.length || 0;
      if (req.body.meetings.length > oldMeetingsCount) {
        const newestMeeting = req.body.meetings[req.body.meetings.length - 1];
        if (newestMeeting && existing.assignedTo) {
          const assignedId = (existing.assignedTo as any)?._id || existing.assignedTo;
          if (assignedId && (!req.user || req.user.id !== assignedId.toString())) {
            await createNotification({
              recipient: assignedId,
              actor: req.user?.id as any,
              type: 'CLIENT_MEETING',
              title: `Meeting Scheduled: ${updated?.name || existing.name}`,
              message: `${req.user?.name || 'A team member'} scheduled "${newestMeeting.title}" for ${newestMeeting.date || 'upcoming'} at ${newestMeeting.time || 'agreed time'}.`,
              link: `/clients/${id}`,
              priority: 'high',
              metadata: { clientId: id },
            });
          }
        }
      }
    }

    // Trigger notification if a payment was logged
    if (req.body.payments && Array.isArray(req.body.payments)) {
      const oldPaymentsCount = existing.payments?.length || 0;
      if (req.body.payments.length > oldPaymentsCount) {
        const newestPayment = req.body.payments[req.body.payments.length - 1];
        if (newestPayment) {
          try {
            const activeUsers = await User.find({ status: 'ACTIVE' }, '_id');
            await notifyUsers(
              activeUsers.map((u) => u._id.toString()),
              {
                actor: req.user ? { id: req.user.id, name: req.user.name } : undefined,
                type: 'PAYMENT_RECEIVED',
                title: `Payment Logged: ${updated?.name || existing.name}`,
                message: `${req.user?.name || 'A team member'} recorded payment "${newestPayment.title}" (${Number(newestPayment.amount || 0).toLocaleString()} ${updated?.currency || 'USD'} - ${newestPayment.status || 'PAID'}).`,
                link: `/clients/${id}`,
                priority: 'high',
                metadata: { clientId: id },
              }
            );
          } catch (payErr) {
            console.error('Failed to notify payment logged:', payErr);
          }
        }
      }
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
