import { Response } from 'express';
import { Approach } from '../models/Approach';
import { Client } from '../models/Client';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middlewares/auth';

export const getApproaches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { niche, status } = req.query;
    const filter: any = {};

    if (niche && niche !== 'ALL') filter.niche = niche;
    if (status && status !== 'ALL') filter.status = status;

    const approaches = await Approach.find(filter)
      .populate('convertedClientId', 'name status')
      .sort({ updatedAt: -1 });

    res.json(approaches);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch approaches', error: error.message });
  }
};

export const getApproachById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const approach = await Approach.findById(id)
      .populate('convertedClientId', 'name status')
      .populate('contactHistory.loggedBy', 'name avatar role');

    if (!approach) {
      res.status(404).json({ message: 'Approach record not found' });
      return;
    }

    res.json(approach);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch approach details', error: error.message });
  }
};

export const createApproach = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      businessName,
      niche,
      contactPerson,
      phone,
      email,
      location,
      status,
      notes,
      lastContactDate,
      nextFollowUpDate,
    } = req.body;

    if (!businessName || !businessName.trim()) {
      res.status(400).json({ message: 'Business name is required' });
      return;
    }

    const contactHistory: any[] = [];
    if (notes && notes.trim() && lastContactDate) {
      contactHistory.push({
        date: new Date(lastContactDate),
        channel: 'OTHER',
        notes: notes.trim(),
        loggedBy: req.user?.id,
      });
    }

    const approach = await Approach.create({
      businessName: businessName.trim(),
      niche: niche?.trim() || 'General',
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      location: location || '',
      status: status || 'PROSPECT',
      notes: notes || '',
      lastContactDate: lastContactDate ? new Date(lastContactDate) : undefined,
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
      contactHistory,
    });

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `added outreach prospect`,
        entityType: 'CLIENT',
        entityTitle: approach.businessName,
      });
    }

    res.status(201).json(approach);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create approach', error: error.message });
  }
};

export const addContactHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, channel, notes, nextFollowUpDate, status } = req.body;

    if (!notes || !notes.trim()) {
      res.status(400).json({ message: 'Notes are required for contact history' });
      return;
    }

    const approach = await Approach.findById(id);
    if (!approach) {
      res.status(404).json({ message: 'Approach record not found' });
      return;
    }

    const contactDate = date ? new Date(date) : new Date();
    const newEntry: any = {
      date: contactDate,
      channel: channel || 'CALL',
      notes: notes.trim(),
      loggedBy: req.user?.id,
    };

    if (nextFollowUpDate) {
      newEntry.nextFollowUpDate = new Date(nextFollowUpDate);
      approach.nextFollowUpDate = new Date(nextFollowUpDate);
    }

    approach.contactHistory.push(newEntry);
    approach.lastContactDate = contactDate;

    if (status) {
      approach.status = status;
    } else if (approach.status === 'PROSPECT') {
      approach.status = 'CONTACTED';
    }

    await approach.save();
    await approach.populate('contactHistory.loggedBy', 'name avatar role');

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `logged ${channel || 'contact'} with ${approach.businessName}`,
        entityType: 'CLIENT',
        entityTitle: approach.businessName,
      });
    }

    res.status(201).json(approach);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add contact log', error: error.message });
  }
};


export const updateApproach = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const approach = await Approach.findByIdAndUpdate(id, req.body, { new: true });

    if (!approach) {
      res.status(404).json({ message: 'Approach record not found' });
      return;
    }

    res.json(approach);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update approach', error: error.message });
  }
};

export const deleteApproach = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const approach = await Approach.findByIdAndDelete(id);

    if (!approach) {
      res.status(404).json({ message: 'Approach record not found' });
      return;
    }

    res.json({ message: 'Approach record deleted', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete approach', error: error.message });
  }
};

export const convertToClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const approach = await Approach.findById(id);

    if (!approach) {
      res.status(404).json({ message: 'Approach record not found' });
      return;
    }

    // Create Official Client
    const client = await Client.create({
      name: approach.businessName,
      contactPerson: approach.contactPerson || '',
      phone: approach.phone || '',
      email: approach.email || '',
      status: 'ACTIVE',
      serviceInterested: approach.niche,
      notes: approach.notes || `Converted from outreach approach. Location: ${approach.location || 'N/A'}`,
      assignedTo: req.user?.id,
    });

    approach.status = 'DEAL_WON';
    approach.convertedClientId = client._id as any;
    await approach.save();

    if (req.user) {
      await Activity.create({
        user: req.user.id,
        userName: req.user.name,
        action: `converted approach to active client`,
        entityType: 'CLIENT',
        entityTitle: client.name,
      });
    }

    res.json({
      message: 'Successfully converted to official Client!',
      client,
      approach,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to convert to client', error: error.message });
  }
};
