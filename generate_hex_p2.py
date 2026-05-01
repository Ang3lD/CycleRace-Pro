import os

base_dir = "server"
files = {}

# EVENTOS
files["src/modules/eventos/infrastructure/database/repositories/MysqlEventoRepository.js"] = """
import { mysqlPool } from '../../../../config/mysql.js';

export class MysqlEventoRepository {
  async findAll() {
    const [rows] = await mysqlPool.query('SELECT * FROM eventos WHERE activo = true ORDER BY fecha_evento ASC');
    return rows;
  }
  
  async findById(id) {
    const [rows] = await mysqlPool.query('SELECT * FROM eventos WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(evento) {
    const [result] = await mysqlPool.query(
      `INSERT INTO eventos (nombre, descripcion, tipo, distancia, categoria, precio, cupo_maximo, fecha_evento, hora_evento, lugar) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [evento.nombre, evento.descripcion, evento.tipo, evento.distancia || null, evento.categoria || 'todos', 
       evento.precio || 0, evento.cupo_maximo || 100, evento.fecha_evento, evento.hora_evento || '08:00:00', evento.lugar]
    );
    return result.insertId;
  }
}
"""

files["src/modules/eventos/infrastructure/http/controllers/EventoController.js"] = """
export class EventoController {
  constructor(eventoRepository) {
    this.eventoRepository = eventoRepository;
  }

  getAll = async (req, res) => {
    try {
      const eventos = await this.eventoRepository.findAll();
      res.json(eventos);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  getById = async (req, res) => {
    try {
      const evento = await this.eventoRepository.findById(req.params.id);
      if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(evento);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  create = async (req, res) => {
    try {
      const { nombre, descripcion, fecha_evento } = req.body;
      if (!nombre || !descripcion || !fecha_evento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
      const id = await this.eventoRepository.create(req.body);
      res.status(201).json({ id, message: 'Evento creado exitosamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
"""

files["src/modules/eventos/infrastructure/http/routes/evento.routes.js"] = """
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
"""

# INSCRIPCIONES
files["src/modules/inscripciones/infrastructure/database/repositories/MysqlInscripcionRepository.js"] = """
import { mysqlPool } from '../../../../config/mysql.js';

export class MysqlInscripcionRepository {
  async findByUserAndEvent(userId, eventId) {
    const [existing] = await mysqlPool.query(
      'SELECT id FROM inscripciones WHERE user_id = ? AND evento_id = ?',
      [userId, eventId]
    );
    return existing[0] || null;
  }

  async create(inscripcion) {
    const [result] = await mysqlPool.query(
      `INSERT INTO inscripciones (user_id, evento_id, nombre_completo, email, telefono, direccion, metodo_pago, monto_pagado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [inscripcion.user_id, inscripcion.evento_id, inscripcion.nombre_completo, inscripcion.email, 
       inscripcion.telefono, inscripcion.direccion, inscripcion.metodo_pago, inscripcion.monto_pagado]
    );
    return result.insertId;
  }

  async findByUserId(userId) {
    const [rows] = await mysqlPool.query(
      `SELECT i.*, e.nombre as evento_nombre, e.tipo_evento, e.fecha_evento, e.ubicacion, e.precio
       FROM inscripciones i JOIN eventos e ON i.evento_id = e.id 
       WHERE i.user_id = ? ORDER BY i.fecha_inscripcion DESC`,
      [userId]
    );
    return rows;
  }

  async findAll() {
    const [rows] = await mysqlPool.query(
      `SELECT i.*, e.nombre as evento_nombre, e.tipo_evento, e.fecha_evento
       FROM inscripciones i JOIN eventos e ON i.evento_id = e.id 
       ORDER BY i.fecha_inscripcion DESC`
    );
    return rows;
  }

  async getNextCompetitorNumber() {
    const [maxNum] = await mysqlPool.query('SELECT MAX(numero_competidor) as max_num FROM inscripciones');
    return (maxNum[0].max_num || 0) + 1;
  }

  async validateStatus(id, competitorNumber) {
    await mysqlPool.query(
      `UPDATE inscripciones SET estado = 'validado', numero_competidor = ?, fecha_validacion = NOW() WHERE id = ?`,
      [competitorNumber, id]
    );
  }

  async rejectStatus(id) {
    await mysqlPool.query(
      `UPDATE inscripciones SET estado = 'rechazado', fecha_validacion = NOW() WHERE id = ?`,
      [id]
    );
  }
}
"""

files["src/modules/inscripciones/infrastructure/database/repositories/MongoPaymentLogRepository.js"] = """
import { paymentsCol } from '../../../../config/mongo.js';

export class MongoPaymentLogRepository {
  async logPayment(data) {
    try {
      await paymentsCol.insertOne({
        ...data,
        fecha_pago: new Date(),
        status: 'completed'
      });
    } catch (err) {
      console.error('MongoDB Logging Error:', err);
    }
  }
}
"""

files["src/modules/inscripciones/application/InscripcionService.js"] = """
export class InscripcionService {
  constructor(inscripcionRepository, paymentLogRepository, userRepository) {
    this.inscripcionRepository = inscripcionRepository;
    this.paymentLogRepository = paymentLogRepository;
    this.userRepository = userRepository;
  }

  async enrollUser(userId, eventoId, metodoPago, monto) {
    const existing = await this.inscripcionRepository.findByUserAndEvent(userId, eventoId);
    if (existing) throw new Error('Ya estás inscrito en este evento');

    const user = await this.userRepository.findById(userId);

    const inscripcionId = await this.inscripcionRepository.create({
      user_id: userId,
      evento_id: eventoId,
      nombre_completo: user.nombre,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      metodo_pago: metodoPago || 'Tarjeta',
      monto_pagado: monto || 0
    });

    await this.paymentLogRepository.logPayment({
      inscripcion_id: inscripcionId,
      user_id: userId,
      user_email: user.email,
      evento_id: eventoId,
      metodo_pago: metodoPago || 'Tarjeta',
      monto: monto || 0
    });

    return inscripcionId;
  }
}
"""

files["src/modules/inscripciones/infrastructure/http/controllers/InscripcionController.js"] = """
export class InscripcionController {
  constructor(inscripcionService, inscripcionRepository) {
    this.inscripcionService = inscripcionService;
    this.inscripcionRepository = inscripcionRepository;
  }

  create = async (req, res) => {
    try {
      const { evento_id, metodo_pago, monto } = req.body;
      if (!evento_id) return res.status(400).json({ error: 'evento_id es requerido' });
      
      const id = await this.inscripcionService.enrollUser(req.user.id, evento_id, metodo_pago, monto);
      res.status(201).json({ id, message: 'Pago e inscripción exitosa' });
    } catch (err) {
      res.status(err.message === 'Ya estás inscrito en este evento' ? 409 : 500).json({ error: err.message });
    }
  }

  getMyInscriptions = async (req, res) => {
    try {
      const rows = await this.inscripcionRepository.findByUserId(req.user.id);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  getAll = async (req, res) => {
    try {
      const rows = await this.inscripcionRepository.findAll();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  validate = async (req, res) => {
    try {
      const nextNum = await this.inscripcionRepository.getNextCompetitorNumber();
      await this.inscripcionRepository.validateStatus(req.params.id, nextNum);
      res.json({ message: 'Inscripción validada', numero_competidor: nextNum });
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  reject = async (req, res) => {
    try {
      await this.inscripcionRepository.rejectStatus(req.params.id);
      res.json({ message: 'Inscripción rechazada' });
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }
}
"""

files["src/modules/inscripciones/infrastructure/http/routes/inscripcion.routes.js"] = """
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
"""

# DASHBOARD
files["src/modules/dashboard/infrastructure/database/repositories/DashboardRepository.js"] = """
import { mysqlPool } from '../../../../config/mysql.js';
import { pgPool } from '../../../../config/postgres.js';

export class DashboardRepository {
  async getStats() {
    const [totalInscritos] = await mysqlPool.query('SELECT COUNT(*) as total FROM inscripciones');
    const [validados] = await mysqlPool.query("SELECT COUNT(*) as total FROM inscripciones WHERE estado = 'validado'");
    const [pendientes] = await mysqlPool.query("SELECT COUNT(*) as total FROM inscripciones WHERE estado = 'pendiente'");
    const [ingresos] = await mysqlPool.query(
      `SELECT COALESCE(SUM(e.precio), 0) as total FROM inscripciones i JOIN eventos e ON i.evento_id = e.id WHERE i.estado = 'validado'`
    );
    const [porCategoria] = await mysqlPool.query(
      `SELECT e.tipo_evento as categoria, COUNT(*) as total 
       FROM inscripciones i JOIN eventos e ON i.evento_id = e.id 
       GROUP BY e.tipo_evento ORDER BY total DESC`
    );
    const totalUsers = await pgPool.query('SELECT COUNT(*) as total FROM users');

    return {
      totalInscritos: totalInscritos[0].total,
      validados: validados[0].total,
      pendientes: pendientes[0].total,
      ingresos: ingresos[0].total,
      totalUsers: parseInt(totalUsers.rows[0].total),
      porCategoria,
    };
  }
}
"""

files["src/modules/dashboard/infrastructure/http/controllers/DashboardController.js"] = """
export class DashboardController {
  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }

  getStats = async (req, res) => {
    try {
      const stats = await this.dashboardRepository.getStats();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno' });
    }
  }
}
"""

files["src/modules/dashboard/infrastructure/http/routes/dashboard.routes.js"] = """
import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { DashboardRepository } from '../../database/repositories/DashboardRepository.js';
import { authenticateToken, requireAdmin } from '../../../../../core/middlewares/auth.middleware.js';

const router = Router();
const repo = new DashboardRepository();
const controller = new DashboardController(repo);

router.get('/stats', authenticateToken, requireAdmin, controller.getStats);

export default router;
"""

# APP.JS
files["src/app.js"] = """
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/infrastructure/http/routes/auth.routes.js';
import eventoRoutes from './modules/eventos/infrastructure/http/routes/evento.routes.js';
import inscripcionRoutes from './modules/inscripciones/infrastructure/http/routes/inscripcion.routes.js';
import dashboardRoutes from './modules/dashboard/infrastructure/http/routes/dashboard.routes.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Registro de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;
"""

# API.JS (ENTRY POINT)
files["api.js"] = """
import app from './src/app.js';
import { env } from './src/config/env.js';
import { pgPool } from './src/config/postgres.js';
import { initMySQL } from './src/config/mysql.js';
import { initMongo } from './src/config/mongo.js';

async function start() {
  try {
    await initMySQL();
    console.log('✅ MySQL connected');
    await initMongo();
    console.log('✅ MongoDB connected');
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
    
    app.listen(env.PORT, () => {
      console.log(`\\n🚴 CycleRace Pro API running on http://localhost:${env.PORT}\\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

print("Estructura Hexagonal completada.")
