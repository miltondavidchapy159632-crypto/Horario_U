const express = require('express');
const { getBlocks, addBlock } = require('../controllers/blocksController');

const router = express.Router();

router.get('/', getBlocks);
router.post('/', addBlock);

module.exports = router;
