import { Request, Response } from 'express';
import { queryTenant } from '../db';

export const getFinanceSummary = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  
  try {
    // Total revenue from delivered orders
    const totalResult = await queryTenant(
      tenantId,
      "SELECT SUM(price) as total FROM orders WHERE tenant_id = $1 AND status = 'Delivered'",
      [tenantId]
    );
    
    // Breakdown by payment mode
    const breakdownResult = await queryTenant(
      tenantId,
      "SELECT payment_mode, SUM(price) as total FROM orders WHERE tenant_id = $1 AND status = 'Delivered' GROUP BY payment_mode",
      [tenantId]
    );
    
    // Pending revenue (Assigned or In_Transit)
    const pendingResult = await queryTenant(
      tenantId,
      "SELECT SUM(price) as total FROM orders WHERE tenant_id = $1 AND status IN ('Assigned', 'In_Transit')",
      [tenantId]
    );

    res.status(200).json({
      message: 'Successfully fetched finance summary',
      data: {
        total_delivered: parseFloat(totalResult.rows[0].total) || 0,
        pending_revenue: parseFloat(pendingResult.rows[0].total) || 0,
        breakdown: breakdownResult.rows
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
