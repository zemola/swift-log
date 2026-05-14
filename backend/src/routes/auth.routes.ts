import { Router } from 'express';
import { login, completeRegistration, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);
router.post('/complete-registration', completeRegistration);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
