import { Router } from 'express';
import {
  getOrders,
  getRiders,
  getRiderOrders,
  createOrder,
  bulkCreateOrders,
  assignOrder,
  updateOrder,
  deleteOrder
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { checkExpirationMiddleware } from '../middleware/expiration.middleware';

const router = Router();

// Apply both middlewares to all order and rider routes
router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(checkExpirationMiddleware);

// Order routes
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.post('/orders/bulk', bulkCreateOrders);
router.put('/orders/:id/assign', assignOrder);
router.put('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

// Rider routes (kept here for simplicity as they are closely related)
router.get('/riders', getRiders);
router.get('/riders/:id/orders', getRiderOrders);

export default router;
