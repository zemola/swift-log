import { Router } from 'express';
import { getAdminTelemetry, listTenantUsers, updateUserStatus, updateUserPassword } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes with auth
router.use(authMiddleware);

router.get('/telemetry', getAdminTelemetry);
router.get('/users', listTenantUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/password', updateUserPassword);

export default router;
