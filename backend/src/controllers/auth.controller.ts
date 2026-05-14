import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Use the new global query function to allow login without tenant context
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    const isValid = await bcrypt.compare(password, user.password_hash || '');
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const completeRegistration = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }
  
  try {
    const result = await query(
      'SELECT * FROM users WHERE invitation_token = $1 AND token_expires > NOW()',
      [token]
    );
    
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const user = result.rows[0];
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    await query(
      'UPDATE users SET password_hash = $1, invitation_token = NULL, token_expires = NULL WHERE id = $2',
      [hash, user.id]
    );
    
    res.status(200).json({ message: 'Registration completed successfully. You can now log in.' });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rowCount === 0) {
      // We return 200 even if email not found for security reasons
      return res.status(200).json({ message: 'If that email exists, we sent a reset link.' });
    }
    
    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    
    await query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
      [token, expires, user.id]
    );
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const emailHtml = `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset for your SwiftLogistics account.</p>
      <p>Please click the link below to set a new password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    
    await sendEmail(email, 'Reset Your Password - SwiftLogistics', emailHtml);
    
    res.status(200).json({ message: 'If that email exists, we sent a reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }
  
  try {
    const result = await query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );
    
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const user = result.rows[0];
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [hash, user.id]
    );
    
    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
