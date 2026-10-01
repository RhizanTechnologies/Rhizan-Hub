import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { sendInvitationEmail } from '../utils/mailer';

const getJwtSecret = () => process.env.JWT_SECRET || 'rhizan_secret_key_change_in_production';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, title, weeklyCapacityHours } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'MEMBER',
      title: title || 'Team Member',
      weeklyCapacityHours: weeklyCapacityHours || 40,
      mustChangePassword: false,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        weeklyCapacityHours: user.weeklyCapacityHours,
        mustChangePassword: user.mustChangePassword ?? false,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to register', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        weeklyCapacityHours: user.weeklyCapacityHours,
        status: user.status,
        mustChangePassword: Boolean(user.mustChangePassword),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      weeklyCapacityHours: user.weeklyCapacityHours,
      status: user.status,
      avatar: user.avatar,
      mustChangePassword: Boolean(user.mustChangePassword),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      res.status(400).json({ message: 'Incorrect current password' });
      return;
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password || '');
    if (isSamePassword) {
      res.status(400).json({ message: 'New password cannot be the same as your temporary password' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Password changed successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        weeklyCapacityHours: user.weeklyCapacityHours,
        status: user.status,
        mustChangePassword: false,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role, title, weeklyCapacityHours, customTemporaryPassword } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ message: 'A team member already exists with this email address' });
      return;
    }

    // Generate random secure temporary password if not provided
    const tempoPassword =
      customTemporaryPassword && customTemporaryPassword.trim().length >= 6
        ? customTemporaryPassword.trim()
        : `Rhizan@${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempoPassword, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      title: title?.trim() || 'Team Member',
      weeklyCapacityHours: Number(weeklyCapacityHours) || 40,
      status: 'ACTIVE',
      mustChangePassword: true,
    });

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      to: newUser.email,
      name: newUser.name,
      temporaryPassword: tempoPassword,
      invitedBy: req.user?.name || 'Rhizan Admin',
    });

    res.status(201).json({
      message: 'Member invited successfully',
      user: {
        id: newUser._id,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        title: newUser.title,
        status: newUser.status,
        weeklyCapacityHours: newUser.weeklyCapacityHours,
        mustChangePassword: true,
      },
      temporaryPassword: tempoPassword,
      emailSent: emailResult.sent,
      emailMessage: emailResult.message,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to invite team member', error: error.message });
  }
};
