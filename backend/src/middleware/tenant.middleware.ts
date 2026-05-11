import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include tenant_id
declare global {
  namespace Express {
    interface Request {
      tenant_id?: string;
    }
  }
}

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In a real application, tenant_id might come from a verified JWT token
  // For this middleware, we'll accept it from a custom header 'x-tenant-id'
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return res.status(401).json({
      error: 'Missing x-tenant-id header',
      message: 'Tenant context is required to access this resource.'
    });
  }

  if (typeof tenantId !== 'string') {
    return res.status(400).json({
      error: 'Invalid x-tenant-id header format',
      message: 'Tenant ID must be a string.'
    });
  }

  // Attach the tenant_id to the request object for downstream use
  req.tenant_id = tenantId;
  
  next();
};
