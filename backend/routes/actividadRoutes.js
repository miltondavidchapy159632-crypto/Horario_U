const express = require('express');
const { addActividadPersonal } = require('../controllers/actividadController');

const router = express.Router();

// Ruta para añadir una actividad personal
router.post('/', addActividadPersonal);

module.exports = router;