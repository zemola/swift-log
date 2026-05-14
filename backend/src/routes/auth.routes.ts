import { Router } from 'express';
import { login, completeRegistration } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/complete-registration', completeRegistration);

export default router;
