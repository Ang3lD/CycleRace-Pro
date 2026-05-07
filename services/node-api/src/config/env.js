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
