const express = require('express');
const multer = require('multer');
const path = require('path');
const { getHitos, addHito, deleteHito, uploadDocument, getDocuments, getAllUpcomingHitos, deleteDocument, analyzeSyllabus } = require('../controllers/plannerController');

const router = express.Router();

// Configuración de Almacenamiento Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rutas de Hitos
router.get('/hitos', getHitos);
router.get('/all-hitos', getAllUpcomingHitos);
router.post('/hitos', addHito);
router.delete('/hitos/:id', deleteHito);

// Rutas de Documentos
router.get('/documents', getDocuments);
router.post('/upload', upload.single('archivo'), uploadDocument);

router.delete('/documents/:id', deleteDocument);

// Ruta de IA
router.post('/analyze-ai', analyzeSyllabus);

module.exports = router;
