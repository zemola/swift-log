import { Router } from 'express';
import { login, completeRegistration, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/complete-registration', completeRegistration);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
