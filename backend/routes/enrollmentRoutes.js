const express = require('express');
const { inscribirGrupo } = require('../controllers/enrollmentController');

const router = express.Router();

// Ruta para inscribir un grupo
router.post('/inscribir-grupo', inscribirGrupo);

module.exports = router;