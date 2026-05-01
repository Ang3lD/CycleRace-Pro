import { pgPool } from '../../../../../config/postgres.js';

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
