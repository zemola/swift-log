import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryTenant } from '../db';
import { sendEmail } from '../utils/email';

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
    
    // Send email to Rider
    if (role === 'Rider') {
      const emailHtml = `
        <h1>Welcome to SwiftLogistics</h1>
        <p>You have been registered as a Rider.</p>
        <p>Here are your login credentials for the Rider App:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please change your password after logging in for security.</p>
      `;
      
      try {
        await sendEmail(email, 'Your Rider Account Credentials', emailHtml);
      } catch (emailErr) {
        console.error('Failed to send email to rider:', emailErr);
      }
    }

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
