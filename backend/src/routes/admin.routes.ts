import { Router } from 'express';
import { getAdminTelemetry, listTenantUsers, updateUserStatus, updateUserPassword } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes with auth
router.use(authMiddleware);

/**
 * @swagger
 * /api/admin/telemetry:
 *   get:
 *     summary: Get telemetry for business admin
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Telemetry data
 */
router.get('/telemetry', getAdminTelemetry);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users for the tenant
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', listTenantUsers);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/users/:id/status', updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}/password:
 *   put:
 *     summary: Change user password
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 */
router.put('/users/:id/password', updateUserPassword);

export default router;
