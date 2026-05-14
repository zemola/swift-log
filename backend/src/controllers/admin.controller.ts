import { Request, Response } from 'express';
import { query } from '../db';
import bcrypt from 'bcryptjs';

// Get telemetry for business admin (scoped to tenant)
export const getAdminTelemetry = async (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  
  try {
    const usersCount = await query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]);
    const ordersCount = await query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [tenantId]);
    
    // Get orders processed per month for the last 6 months for this tenant
    const chartData = await query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) as count
      FROM orders 
      WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `, [tenantId]);
    
    res.status(200).json({
      data: {
        totalUsers: parseInt(usersCount.rows[0].count, 10),
        totalOrders: parseInt(ordersCount.rows[0].count, 10),
        chartData: chartData.rows
      }
    });
  } catch (error) {
    console.error('Get admin telemetry error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// List all users for the tenant
export const listTenantUsers = async (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  
  try {
    const result = await query(
      'SELECT id, email, role, status, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('List tenant users error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update user status
export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!status || !tenantId) {
    return res.status(400).json({ error: 'Status and Tenant ID are required' });
  }
  
  try {
    // Ensure the user belongs to the tenant
    const checkResult = await query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or access denied' });
    }
    
    const result = await query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    res.status(200).json({
      message: 'User status updated',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Change user password
export const updateUserPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!password || !tenantId) {
    return res.status(400).json({ error: 'Password and Tenant ID are required' });
  }
  
  try {
    // Ensure the user belongs to the tenant
    const checkResult = await query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or access denied' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hash, id]
    );
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update user password error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
