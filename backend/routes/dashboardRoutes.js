const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

// Middleware para verificar si la ruta está siendo alcanzada
router.use((req, res, next) => {
  console.log('Middleware alcanzado en /dashboard');
  next();
});

// Ruta para obtener el dashboard
router.get('/', getDashboard);

module.exports = router;