import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CEO' | 'CTO' | 'COO' | 'ADMIN' | 'MEMBER' | string;
    name: string;
  };
}

export const isExecutiveOrAdmin = (role?: string): boolean => {
  return ['CEO', 'CTO', 'COO', 'ADMIN'].includes(role || '');
};

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'rhizan_secret_key_change_in_production';

  try {
    const decoded = jwt.verify(token, secret) as any;
    const userId = decoded?.id || decoded?._id;

    if (!userId) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    // Verify user still exists in the database
    const user = await User.findById(userId).select('_id email role name status');
    if (!user) {
      res.status(401).json({ message: 'Your account no longer exists or has been deactivated.' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (err: any) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!isExecutiveOrAdmin(req.user?.role)) {
    res.status(403).json({ message: 'Executive (CEO/CTO/COO) or Admin privileges required' });
    return;
  }
  next();
};
