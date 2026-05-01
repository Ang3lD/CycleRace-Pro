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
      console.log(`\n🚴 CycleRace Pro API running on http://localhost:${env.PORT}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
