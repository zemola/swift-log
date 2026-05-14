import { Router } from 'express';
import { listCompanies, createCompanyWithInvitation, updateCompanyStatus, getCompanyDetails } from '../controllers/superadmin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { superAdminMiddleware } from '../middleware/superadmin.middleware';

const router = Router();

// Protect all routes with auth and superadmin check
router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get('/companies', listCompanies);
router.post('/companies', createCompanyWithInvitation);
router.put('/companies/:id/status', updateCompanyStatus);
router.get('/companies/:id/details', getCompanyDetails);

export default router;
