import { Request, Response, NextFunction } from 'express';

export const superAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'SuperAdmin') {
    return res.status(403).json({ error: 'Access denied. Super Admin role required.' });
  }
  
  next();
};
