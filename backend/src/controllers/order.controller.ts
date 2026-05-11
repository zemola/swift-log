import { Request, Response } from 'express';
import { queryTenant } from '../db';
import { sendEmail } from '../services/email.service';

export const getOrders = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  
  try {
    const result = await queryTenant(tenantId, 'SELECT * FROM orders WHERE tenant_id = $1', [tenantId]);
    
    res.status(200).json({
      message: 'Successfully fetched orders for tenant',
      tenant_id: tenantId,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRiders = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  
  try {
    const result = await queryTenant(
      tenantId,
      'SELECT id, email, role FROM users WHERE tenant_id = $1 AND role = $2',
      [tenantId, 'Rider']
    );
    
    res.status(200).json({
      message: 'Successfully fetched riders for tenant',
      tenant_id: tenantId,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRiderOrders = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  const { id } = req.params;
  
  try {
    const result = await queryTenant(
      tenantId,
      'SELECT * FROM orders WHERE tenant_id = $1 AND rider_id = $2',
      [tenantId, id]
    );
    
    res.status(200).json({
      message: 'Successfully fetched orders for rider',
      rider_id: id,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  const { item_desc, price, pickup_addr, dropoff_addr, payment_mode, status, customer_name, customer_phone } = req.body;
  
  try {
    const result = await queryTenant(
      tenantId,
      'INSERT INTO orders (tenant_id, item_desc, price, pickup_addr, dropoff_addr, payment_mode, status, customer_name, customer_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [tenantId, item_desc, price, pickup_addr, dropoff_addr, payment_mode, status || 'Pending', customer_name, customer_phone]
    );
    
    // Log status history
    await queryTenant(
      tenantId,
      'INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)',
      [result.rows[0].id, status || 'Pending']
    );
    
    res.status(201).json({
      message: 'Successfully created order',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const bulkCreateOrders = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  const { orders } = req.body;
  
  if (!orders || !Array.isArray(orders)) {
    return res.status(400).json({ error: 'Orders array is required' });
  }
  
  try {
    const insertedOrders = [];
    
    for (const order of orders) {
      const { item_desc, price, pickup_addr, dropoff_addr, payment_mode, status, customer_name, customer_phone } = order;
      const result = await queryTenant(
        tenantId,
        'INSERT INTO orders (tenant_id, item_desc, price, pickup_addr, dropoff_addr, payment_mode, status, customer_name, customer_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [tenantId, item_desc, price || 0, pickup_addr, dropoff_addr, payment_mode || 'Cash', status || 'Pending', customer_name, customer_phone]
      );
      
      // Log status history
      await queryTenant(
        tenantId,
        'INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)',
        [result.rows[0].id, status || 'Pending']
      );
      
      insertedOrders.push(result.rows[0]);
    }
    
    res.status(201).json({
      message: `Successfully created ${insertedOrders.length} orders`,
      data: insertedOrders
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const assignOrder = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  const { id } = req.params;
  const { rider_id } = req.body;
  
  if (!rider_id) {
    return res.status(400).json({ error: 'Rider ID is required' });
  }
  
  try {
    // Verify rider exists and belongs to tenant
    const riderCheck = await queryTenant(
      tenantId,
      'SELECT id FROM users WHERE id = $1 AND tenant_id = $2 AND role = $3',
      [rider_id, tenantId, 'Rider']
    );
    
    if (riderCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Rider not found or unauthorized' });
    }
    
    // Update order
    const result = await queryTenant(
      tenantId,
      'UPDATE orders SET rider_id = $1, status = $2 WHERE id = $3 AND tenant_id = $4 RETURNING *',
      [rider_id, 'Assigned', id, tenantId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }
    
    // Log status history
    await queryTenant(
      tenantId,
      'INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)',
      [id, 'Assigned']
    );
    
    // Send notification email
    try {
      await sendEmail(
        'azeemolatunji@gmail.com',
        'Order Assigned',
        `Order ${id} has been assigned to rider ${rider_id}.`,
        `<p>Order <strong>${id}</strong> has been assigned to rider <strong>${rider_id}</strong>.</p>`
      );
    } catch (emailErr) {
      console.error('Failed to send notification email:', emailErr);
    }
    
    res.status(200).json({
      message: 'Successfully assigned order to rider',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  const { id } = req.params;
  const { item_desc, price, pickup_addr, dropoff_addr, payment_mode, status, customer_name, customer_phone, signature_data } = req.body;
  
  try {
    const result = await queryTenant(
      tenantId,
      'UPDATE orders SET item_desc = COALESCE($1, item_desc), price = COALESCE($2, price), pickup_addr = COALESCE($3, pickup_addr), dropoff_addr = COALESCE($4, dropoff_addr), payment_mode = COALESCE($5, payment_mode), status = COALESCE($6, status), customer_name = COALESCE($7, customer_name), customer_phone = COALESCE($8, customer_phone), signature_data = COALESCE($9, signature_data) WHERE id = $10 AND tenant_id = $11 RETURNING *',
      [item_desc, price, pickup_addr, dropoff_addr, payment_mode, status, customer_name, customer_phone, signature_data, id, tenantId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }
    
    // Log status history if status changed
    if (status) {
      await queryTenant(
        tenantId,
        'INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)',
        [id, status]
      );
    }
    
    // Send notification email if delivered
    if (status === 'Delivered') {
      try {
        await sendEmail(
          'azeemolatunji@gmail.com',
          'Order Delivered',
          `Order ${id} has been delivered.`,
          `<p>Order <strong>${id}</strong> has been delivered.</p>`
        );
      } catch (emailErr) {
        console.error('Failed to send notification email:', emailErr);
      }
    }
    
    res.status(200).json({
      message: 'Successfully updated order',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const tenantId = req.tenant_id as string;
  const { id } = req.params;
  
  try {
    const result = await queryTenant(
      tenantId,
      'DELETE FROM orders WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenantId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }
    
    res.status(200).json({
      message: 'Successfully deleted order',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
