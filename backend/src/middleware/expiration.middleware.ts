import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

export const checkExpirationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenant_id;
  
  if (!tenantId) {
    return next(); // If no tenant context, skip (e.g., Super Admin or public routes)
  }
  
  try {
    const result = await query('SELECT expires_at, status FROM companies WHERE id = $1', [tenantId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const company = result.rows[0];
    
    if (company.status === 'suspended') {
      return res.status(403).json({ error: 'Access revoked. Contact Super Admin.' });
    }
    
    if (company.expires_at && new Date(company.expires_at) < new Date()) {
      return res.status(403).json({ error: 'Subscription expired. Contact Super Admin.' });
    }
    
    next();
  } catch (error) {
    console.error('Check expiration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
