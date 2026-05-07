import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { DashboardRepository } from '../../database/repositories/DashboardRepository.js';
import { authenticateToken, requireAdmin } from '../../../../../core/middlewares/auth.middleware.js';

const router = Router();
const repo = new DashboardRepository();
const controller = new DashboardController(repo);

router.get('/stats', authenticateToken, requireAdmin, controller.getStats);

export default router;
