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
