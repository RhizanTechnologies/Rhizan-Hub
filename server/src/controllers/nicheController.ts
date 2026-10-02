import { Response } from 'express';
import { Niche } from '../models/Niche';
import { Approach } from '../models/Approach';
import { AuthRequest } from '../middlewares/auth';

const DEFAULT_NICHES = [
  'Bakery & Cafe',
  'Retail & Supermarket',
  'Logistics & Fleet',
  'Restaurant & Bistro',
  'Printing & Publishing',
  'Healthcare & Clinic',
  'Real Estate & Property',
  'Hospitality & Hotel',
];

export const getNiches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let niches = await Niche.find().sort({ name: 1 });

    // Seed defaults if empty
    if (niches.length === 0) {
      await Niche.insertMany(
        DEFAULT_NICHES.map((name) => ({ name, description: `Outreach niche for ${name}` }))
      );
      niches = await Niche.find().sort({ name: 1 });
    }

    res.json(niches);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch niches', error: error.message });
  }
};

export const createNiche = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Niche name is required' });
      return;
    }

    const trimmedName = name.trim();

    // Check case-insensitive duplicate
    const existing = await Niche.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      res.status(400).json({ message: `Niche "${trimmedName}" already exists` });
      return;
    }

    const niche = await Niche.create({
      name: trimmedName,
      description: description ? description.trim() : '',
      color: color || '#0d9488',
    });

    res.status(201).json(niche);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create niche', error: error.message });
  }
};

export const updateNiche = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const currentNiche = await Niche.findById(id);
    if (!currentNiche) {
      res.status(404).json({ message: 'Niche not found' });
      return;
    }

    const oldName = currentNiche.name;
    let newName = oldName;

    if (name && name.trim()) {
      newName = name.trim();
      if (newName.toLowerCase() !== oldName.toLowerCase()) {
        const existing = await Niche.findOne({
          _id: { $ne: id },
          name: { $regex: new RegExp(`^${newName}$`, 'i') },
        });
        if (existing) {
          res.status(400).json({ message: `Niche "${newName}" already exists` });
          return;
        }
      }
    }

    currentNiche.name = newName;
    if (description !== undefined) currentNiche.description = description.trim();
    if (color !== undefined) currentNiche.color = color;

    await currentNiche.save();

    // Cascade update to approaches if name was modified
    if (oldName !== newName) {
      await Approach.updateMany({ niche: oldName }, { niche: newName });
    }

    res.json(currentNiche);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update niche', error: error.message });
  }
};

export const deleteNiche = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const niche = await Niche.findById(id);

    if (!niche) {
      res.status(404).json({ message: 'Niche not found' });
      return;
    }

    await Niche.findByIdAndDelete(id);

    res.json({ message: 'Niche deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete niche', error: error.message });
  }
};
