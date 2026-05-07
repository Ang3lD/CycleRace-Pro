import { Router } from 'express';
import { EventoController } from '../controllers/EventoController.js';
import { MysqlEventoRepository } from '../../database/repositories/MysqlEventoRepository.js';
import { authenticateToken, requireAdmin } from '../../../../../core/middlewares/auth.middleware.js';

const router = Router();
const eventoRepository = new MysqlEventoRepository();
const eventoController = new EventoController(eventoRepository);

router.get('/', eventoController.getAll);
router.get('/:id', eventoController.getById);
router.post('/', authenticateToken, requireAdmin, eventoController.create);

export default router;
