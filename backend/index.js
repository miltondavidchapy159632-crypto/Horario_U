const express = require('express');
const { poolPromise } = require('./config/db');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const courseRoutes = require('./routes/courseRoutes');
const blocksRoutes = require('./routes/blocksRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const pool = await poolPromise;
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

// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});