import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../../../application/AuthService.js';
import { PostgresUserRepository } from '../../database/repositories/PostgresUserRepository.js';
import { authenticateToken, requireAdmin } from '../../../../../core/middlewares/auth.middleware.js';

const router = Router();
const userRepository = new PostgresUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService, userRepository);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticateToken, authController.me);
router.get('/users', authenticateToken, requireAdmin, authController.users);

export default router;
