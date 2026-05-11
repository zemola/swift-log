import { Router } from 'express';
import { createUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Apply auth and tenant middleware to protect this route
router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', createUser);

export default router;
