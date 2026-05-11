import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryTenant } from '../db';

export const createUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const tenantId = req.tenant_id as string; // Extracted from token by authMiddleware
  
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const result = await queryTenant(
      tenantId,
      'INSERT INTO users (tenant_id, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, role, tenant_id',
      [tenantId, email, role, passwordHash]
    );
    
    res.status(201).json({
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    if ((error as any).code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
