import { Request, Response } from 'express';
import { query } from '../db';

export const createCompany = async (req: Request, res: Response) => {
  const { name, license_key } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Company name is required' });
  }
  
  try {
    // Generate a random license key if not provided
    const key = license_key || Math.random().toString(36).substring(2, 12).toUpperCase();
    
    const result = await query(
      'INSERT INTO companies (name, license_key) VALUES ($1, $2) RETURNING *',
      [name, key]
    );
    
    res.status(201).json({
      message: 'Company created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create company error:', error);
    // Check for unique constraint violation on license_key
    if ((error as any).code === '23505') {
      return res.status(400).json({ error: 'License key already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
