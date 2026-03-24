const express = require('express');
const { addActividadPersonal, moveActividad, deleteActividad } = require('../controllers/actividadController');

const router = express.Router();

// Ruta para añadir una actividad personal
router.post('/', addActividadPersonal);

// Ruta para mover una actividad
router.put('/move', moveActividad);

// Ruta para eliminar una actividad
router.delete('/:id', deleteActividad);

module.exports = router;