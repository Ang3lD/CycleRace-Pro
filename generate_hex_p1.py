import os

base_dir = "server"
os.makedirs(os.path.join(base_dir, "src/config"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/core/middlewares"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/auth/infrastructure/database/repositories"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/auth/application"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/auth/infrastructure/http/controllers"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/auth/infrastructure/http/routes"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/eventos/infrastructure/database/repositories"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/eventos/application"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/eventos/infrastructure/http/controllers"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/eventos/infrastructure/http/routes"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/inscripciones/infrastructure/database/repositories"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/inscripciones/application"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/inscripciones/infrastructure/http/controllers"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/inscripciones/infrastructure/http/routes"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/dashboard/infrastructure/database/repositories"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/dashboard/application"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/dashboard/infrastructure/http/controllers"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/modules/dashboard/infrastructure/http/routes"), exist_ok=True)

files = {}

files["src/config/env.js"] = """
export const env = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'cyclerace_jwt_secret_2026_lucars',
  JWT_EXPIRES: '2h',
  PG_HOST: process.env.PG_HOST || 'cyclerace-postgres',
  PG_PORT: 5432,
  PG_DB: 'auth_db',
  PG_USER: 'auth_user',
  PG_PASS: 'auth_secret_2026',
  MYSQL_HOST: process.env.MYSQL_HOST || 'cyclerace-mysql',
  MYSQL_PORT: 3306,
  MYSQL_DB: 'registration_db',
  MYSQL_USER: 'registration_user',
  MYSQL_PASS: 'registration_secret_2026',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://payment_admin:payment_secret_2026@cyclerace-mongo:27017'
};
"""

files["src/config/postgres.js"] = """
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;
export const pgPool = new Pool({
  host: env.PG_HOST,
  port: env.PG_PORT,
  database: env.PG_DB,
  user: env.PG_USER,
  password: env.PG_PASS,
});
"""

files["src/config/mysql.js"] = """
import mysql from 'mysql2/promise';
import { env } from './env.js';

export let mysqlPool;
export async function initMySQL() {
  mysqlPool = await mysql.createPool({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    database: env.MYSQL_DB,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASS,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });
}
"""

files["src/config/mongo.js"] = """
import { MongoClient } from 'mongodb';
import { env } from './env.js';

export const mongoClient = new MongoClient(env.MONGO_URL);
export let paymentsCol;

export async function initMongo() {
  await mongoClient.connect();
  const db = mongoClient.db('payments_db');
  paymentsCol = db.collection('payment_logs');
}
"""

files["src/core/middlewares/auth.middleware.js"] = """
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}
"""

# AUTH
files["src/modules/auth/infrastructure/database/repositories/PostgresUserRepository.js"] = """
import { pgPool } from '../../../../config/postgres.js';

export class PostgresUserRepository {
  async findByEmail(email) {
    const res = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
  }
  
  async findById(id) {
    const res = await pgPool.query(
      'SELECT id, email, nombre, telefono, direccion, rol, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async create(user) {
    const res = await pgPool.query(
      `INSERT INTO users (email, password_hash, nombre, telefono, direccion, rol) 
       VALUES ($1, $2, $3, $4, $5, 'corredor') RETURNING id, email, nombre, rol`,
      [user.email, user.password_hash, user.nombre, user.telefono || null, user.direccion || null]
    );
    return res.rows[0];
  }

  async updatePassword(id, hashedPassword) {
    await pgPool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, id]);
  }

  async findAll() {
    const res = await pgPool.query('SELECT id, email, nombre, telefono, direccion, rol, activo, created_at FROM users ORDER BY created_at DESC');
    return res.rows;
  }
}
"""

files["src/modules/auth/application/AuthService.js"] = """
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';

export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.activo) throw new Error('Credenciales inválidas');

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) throw new Error('Credenciales inválidas');

    return this.generateTokenResponse(user);
  }

  async register(userData) {
    const existing = await this.userRepository.findByEmail(userData.email);
    if (existing) throw new Error('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.userRepository.create({
      ...userData,
      password_hash: hashedPassword
    });

    return this.generateTokenResponse(newUser);
  }

  async forgotPassword(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return { message: 'Si el email existe, se enviará un enlace de recuperación.' };

    const resetToken = jwt.sign({ id: user.id, type: 'reset' }, env.JWT_SECRET, { expiresIn: '30m' });
    return {
      message: 'Si el email existe, se enviará un enlace de recuperación.',
      _demo_token: resetToken,
    };
  }

  async resetPassword(token, newPassword) {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.type !== 'reset') throw new Error('Token inválido');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(decoded.id, hashed);
  }

  generateTokenResponse(user) {
    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES }
    );
    return {
      token,
      user: {
        id: user.id, email: user.email, nombre: user.nombre,
        telefono: user.telefono, direccion: user.direccion, rol: user.rol
      }
    };
  }
}
"""

files["src/modules/auth/infrastructure/http/controllers/AuthController.js"] = """
export class AuthController {
  constructor(authService, userRepository) {
    this.authService = authService;
    this.userRepository = userRepository;
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  register = async (req, res) => {
    try {
      const { nombre, email, password } = req.body;
      if (!nombre || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(409).json({ error: err.message });
    }
  }

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email requerido' });
      const result = await this.authService.forgotPassword(email);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ error: 'Faltan datos' });
      await this.authService.resetPassword(token, newPassword);
      res.json({ message: 'Contraseña actualizada' });
    } catch (err) {
      res.status(400).json({ error: 'Token inválido' });
    }
  }

  me = async (req, res) => {
    try {
      const user = await this.userRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  users = async (req, res) => {
    try {
      const users = await this.userRepository.findAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }
}
"""

files["src/modules/auth/infrastructure/http/routes/auth.routes.js"] = """
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
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

print("Generados módulos de Auth y config.")
