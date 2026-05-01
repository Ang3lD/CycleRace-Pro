import { Router } from 'express';
import { InscripcionController } from '../controllers/InscripcionController.js';
import { InscripcionService } from '../../../application/InscripcionService.js';
import { MysqlInscripcionRepository } from '../../database/repositories/MysqlInscripcionRepository.js';
import { MongoPaymentLogRepository } from '../../database/repositories/MongoPaymentLogRepository.js';
import { PostgresUserRepository } from '../../../../auth/infrastructure/database/repositories/PostgresUserRepository.js';
import { authenticateToken, requireAdmin } from '../../../../../core/middlewares/auth.middleware.js';

const router = Router();
const inscripcionRepo = new MysqlInscripcionRepository();
const paymentLogRepo = new MongoPaymentLogRepository();
const userRepo = new PostgresUserRepository();

const inscripcionService = new InscripcionService(inscripcionRepo, paymentLogRepo, userRepo);
const inscripcionController = new InscripcionController(inscripcionService, inscripcionRepo);

router.post('/', authenticateToken, inscripcionController.create);
router.get('/me', authenticateToken, inscripcionController.getMyInscriptions);
router.get('/', authenticateToken, requireAdmin, inscripcionController.getAll);
router.put('/:id/validar', authenticateToken, requireAdmin, inscripcionController.validate);
router.put('/:id/rechazar', authenticateToken, requireAdmin, inscripcionController.reject);

export default router;
