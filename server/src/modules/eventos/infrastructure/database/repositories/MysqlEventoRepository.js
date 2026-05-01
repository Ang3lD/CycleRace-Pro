import { mysqlPool } from '../../../../../config/mysql.js';

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
