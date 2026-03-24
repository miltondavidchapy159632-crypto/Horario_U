const express = require('express');
const { getCatalog, getInscribedCourses } = require('../controllers/courseController');

const router = express.Router();

router.get('/catalog', getCatalog);
router.get('/inscribed', getInscribedCourses);

module.exports = router;
