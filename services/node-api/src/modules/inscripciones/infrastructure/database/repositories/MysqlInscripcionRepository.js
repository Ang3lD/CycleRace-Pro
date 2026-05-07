import { mysqlPool } from '../../../../../config/mysql.js';

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
