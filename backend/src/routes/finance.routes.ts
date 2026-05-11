import { Router } from 'express';
import { getFinanceSummary } from '../controllers/finance.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Apply auth and tenant middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/summary', getFinanceSummary);

export default router;
