// ============================================
// CycleRace Pro — Backend API
// Connects to Dockerized PostgreSQL & MySQL
// ============================================

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const { Pool } = pg;
const app = express();
const PORT = 3001;
const JWT_SECRET = 'cyclerace_jwt_secret_2026_lucars';
const JWT_EXPIRES = '2h';

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── PostgreSQL Connection (Auth Service) ───
const pgPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'auth_db',
  user: 'auth_user',
  password: 'auth_secret_2026',
});

// ─── MySQL Connection (Registration Service) ───
import mysql from 'mysql2/promise';

let mysqlPool;
async function initMySQL() {
  mysqlPool = await mysql.createPool({
    host: 'localhost',
    port: 3306,
    database: 'registration_db',
    user: 'registration_user',
    password: 'registration_secret_2026',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });
}

// ─── MongoDB Connection (Payments & Reports) ───
const mongoUrl = 'mongodb://payment_admin:payment_secret_2026@localhost:27017';
const mongoClient = new MongoClient(mongoUrl);
let paymentsCol;

async function initMongo() {
  await mongoClient.connect();
  const db = mongoClient.db('payments_db');
  paymentsCol = db.collection('payment_logs');
}

// ─── Auth Middleware ───
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}

// ═══════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await pgPool.query('SELECT * FROM users WHERE email = $1 AND activo = true', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono,
        direccion: user.direccion,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // Check if email already exists
    const existing = await pgPool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pgPool.query(
      `INSERT INTO users (email, password_hash, nombre, telefono, direccion, rol) 
       VALUES ($1, $2, $3, $4, $5, 'corredor') RETURNING id, email, nombre, rol`,
      [email, hashedPassword, nombre, telefono || null, direccion || null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email es requerido' });

    const result = await pgPool.query('SELECT id, nombre FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'Si el email existe, se enviará un enlace de recuperación.' });
    }

    // In production, send email with reset token. For demo, generate a reset token.
    const resetToken = jwt.sign({ id: result.rows[0].id, type: 'reset' }, JWT_SECRET, { expiresIn: '30m' });
    
    res.json({
      message: 'Si el email existe, se enviará un enlace de recuperación.',
      // Only for demo purposes — in production, don't return the token
      _demo_token: resetToken,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'reset') return res.status(400).json({ error: 'Token inválido' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pgPool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashed, decoded.id]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
});

// GET /api/auth/me — Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT id, email, nombre, telefono, direccion, rol, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/auth/users — Admin only: list all users
app.get('/api/auth/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT id, email, nombre, telefono, direccion, rol, activo, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Users list error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ═══════════════════════════════════════════
// EVENTS / CARRERAS ENDPOINTS (MySQL)
// ═══════════════════════════════════════════

// GET /api/eventos — List all events (public)
app.get('/api/eventos', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query('SELECT * FROM eventos WHERE activo = true ORDER BY fecha_evento ASC');
    res.json(rows);
  } catch (err) {
    console.error('Eventos error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/eventos/:id — Get single event
app.get('/api/eventos/:id', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query('SELECT * FROM eventos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Evento detail error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/inscripciones — User registers for an event
app.post('/api/inscripciones', authenticateToken, async (req, res) => {
  try {
    const { evento_id, metodo_pago, monto } = req.body;
    if (!evento_id) return res.status(400).json({ error: 'evento_id es requerido' });

    // Check if user is already registered for this event
    const [existing] = await mysqlPool.query(
      'SELECT id FROM inscripciones WHERE user_id = ? AND evento_id = ?',
      [req.user.id, evento_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya estás inscrito en este evento' });
    }

    // Get user info from PostgreSQL
    const userResult = await pgPool.query('SELECT nombre, email, telefono, direccion FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Register in MySQL
    const [result] = await mysqlPool.query(
      `INSERT INTO inscripciones (user_id, evento_id, nombre_completo, email, telefono, direccion, metodo_pago, monto_pagado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, evento_id, user.nombre, user.email, user.telefono, user.direccion, metodo_pago || 'Tarjeta', monto || 0]
    );

    // Log payment in MongoDB
    try {
      await paymentsCol.insertOne({
        inscripcion_id: result.insertId,
        user_id: req.user.id,
        user_email: user.email,
        evento_id: evento_id,
        metodo_pago: metodo_pago || 'Tarjeta',
        monto: monto || 0,
        fecha_pago: new Date(),
        status: 'completed'
      });
    } catch (mongoErr) {
      console.error('MongoDB Logging Error:', mongoErr);
      // We don't fail the request if logging fails, but it's good to know
    }

    res.status(201).json({ id: result.insertId, message: 'Pago e inscripción exitosa' });
  } catch (err) {
    console.error('Inscripción error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/inscripciones/me — User's inscriptions
app.get('/api/inscripciones/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(
      `SELECT i.*, e.nombre as evento_nombre, e.tipo_evento, e.fecha_evento, e.ubicacion, e.precio
       FROM inscripciones i 
       JOIN eventos e ON i.evento_id = e.id 
       WHERE i.user_id = ? 
       ORDER BY i.fecha_inscripcion DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Mis inscripciones error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/inscripciones — Admin: all inscriptions
app.get('/api/inscripciones', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(
      `SELECT i.*, e.nombre as evento_nombre, e.tipo_evento, e.fecha_evento
       FROM inscripciones i 
       JOIN eventos e ON i.evento_id = e.id 
       ORDER BY i.fecha_inscripcion DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('All inscripciones error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/inscripciones/:id/validar — Admin validates
app.put('/api/inscripciones/:id/validar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get next competitor number
    const [maxNum] = await mysqlPool.query('SELECT MAX(numero_competidor) as max_num FROM inscripciones');
    const nextNum = (maxNum[0].max_num || 0) + 1;

    await mysqlPool.query(
      `UPDATE inscripciones SET estado = 'validado', numero_competidor = ?, fecha_validacion = NOW() WHERE id = ?`,
      [nextNum, req.params.id]
    );
    res.json({ message: 'Inscripción validada', numero_competidor: nextNum });
  } catch (err) {
    console.error('Validar error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/inscripciones/:id/rechazar — Admin rejects
app.put('/api/inscripciones/:id/rechazar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await mysqlPool.query(
      `UPDATE inscripciones SET estado = 'rechazado', fecha_validacion = NOW() WHERE id = ?`,
      [req.params.id]
    );
    res.json({ message: 'Inscripción rechazada' });
  } catch (err) {
    console.error('Rechazar error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/dashboard/stats — Admin dashboard stats
app.get('/api/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
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

    res.json({
      totalInscritos: totalInscritos[0].total,
      validados: validados[0].total,
      pendientes: pendientes[0].total,
      ingresos: ingresos[0].total,
      totalUsers: parseInt(totalUsers.rows[0].total),
      porCategoria,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── Start Server ───
async function start() {
  try {
    await initMySQL();
    console.log('✅ MySQL connected');
    await initMongo();
    console.log('✅ MongoDB connected');
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
    app.listen(PORT, () => {
      console.log(`\n🚴 CycleRace Pro API running on http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.log('\n💡 Make sure Docker containers are running: docker compose up -d\n');
    process.exit(1);
  }
}

start();
