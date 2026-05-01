import { mysqlPool } from '../../../../../config/mysql.js';
import { pgPool } from '../../../../../config/postgres.js';

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
