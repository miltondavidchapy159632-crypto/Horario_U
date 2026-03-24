const express = require('express');
const { inscribirGrupo, desinscribirGrupo } = require('../controllers/enrollmentController');

const router = express.Router();

// Ruta para inscribir un grupo
router.post('/inscribir-grupo', inscribirGrupo);

// Ruta para desinscribir un grupo
router.delete('/desinscribir-grupo', desinscribirGrupo);

module.exports = router;