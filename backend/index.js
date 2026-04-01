const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const { poolPromise } = require('./config/db');

// --- EMERGENCY CRASH PROTECTOR ---
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
  // Optional: monitor if we should exit, but for now we keep it alive
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});
// ---------------------------------

const enrollmentRoutes = require('./routes/enrollmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const courseRoutes = require('./routes/courseRoutes');
const blocksRoutes = require('./routes/blocksRoutes');
const statsRoutes = require('./routes/statsRoutes');
const plannerRoutes = require('./routes/plannerRoutes');

const { getPool } = require('./config/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 AS test');
    res.status(200).json({ message: 'Conexión exitosa', result: result.recordset });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({ message: 'Error al conectar a la base de datos', error });
  }
});

// Rutas
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/actividad', actividadRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/blocks', blocksRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/planner', plannerRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('--- Global Error Handler ---');
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});