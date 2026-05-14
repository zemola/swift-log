import { Request, Response } from 'express';
import { query } from '../db';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';

// List all companies
export const listCompanies = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM companies ORDER BY created_at DESC');
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create company and generate invitation token
export const createCompanyWithInvitation = async (req: Request, res: Response) => {
  const { name, ownerEmail, expiresAt } = req.body;
  
  if (!name || !ownerEmail) {
    return res.status(400).json({ error: 'Company name and owner email are required' });
  }
  
  try {
    // 1. Create Company
    const licenseKey = Math.random().toString(36).substring(2, 12).toUpperCase();
    const companyResult = await query(
      'INSERT INTO companies (name, license_key, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [name, licenseKey, expiresAt]
    );
    
    const company = companyResult.rows[0];
    
    // 2. Create User with Invitation Token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours expiry
    
    await query(
      'INSERT INTO users (email, role, tenant_id, invitation_token, token_expires) VALUES ($1, $2, $3, $4, $5)',
      [ownerEmail, 'Admin', company.id, token, expires]
    );
    
    // 3. Send Email
    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?token=${token}`;
    const emailHtml = `
      <h1>Welcome to SwiftLogistics</h1>
      <p>You have been onboarded as a business owner on SwiftLogistics.</p>
      <p>Please click the link below to complete your registration and set your password:</p>
      <a href="${registrationLink}">${registrationLink}</a>
      <p>This link will expire in 24 hours.</p>
    `;
    
    try {
      await sendEmail(ownerEmail, 'Complete Your Registration - SwiftLogistics', emailHtml);
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
      // We still return success but note that email failed
      return res.status(201).json({
        message: 'Company created but invitation email failed to send',
        data: {
          company,
          invitationToken: token,
          emailError: true
        }
      });
    }
    
    res.status(201).json({
      message: 'Company created and invitation sent',
      data: {
        company,
        invitationToken: token
      }
    });
  } catch (error) {
    console.error('Create company with invitation error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update company status (Revoke access)
export const updateCompanyStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  try {
    const result = await query(
      'UPDATE companies SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.status(200).json({
      message: 'Company status updated',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update company status error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get company details (users and stats)
export const getCompanyDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // 1. Get Company Info
    const companyResult = await query('SELECT * FROM companies WHERE id = $1', [id]);
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    const company = companyResult.rows[0];
    
    // 2. Get Users
    const usersResult = await query(
      'SELECT id, email, role, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    // 3. Get Order Count
    const ordersResult = await query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [id]);
    const orderCount = parseInt(ordersResult.rows[0].count, 10);
    
    res.status(200).json({
      data: {
        company,
        users: usersResult.rows,
        stats: {
          totalOrders: orderCount
        }
      }
    });
  } catch (error) {
    console.error('Get company details error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
