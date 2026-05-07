import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/infrastructure/http/routes/auth.routes.js';
import eventoRoutes from './modules/eventos/infrastructure/http/routes/evento.routes.js';
import inscripcionRoutes from './modules/inscripciones/infrastructure/http/routes/inscripcion.routes.js';
import dashboardRoutes from './modules/dashboard/infrastructure/http/routes/dashboard.routes.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Registro de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;
