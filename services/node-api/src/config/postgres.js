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
