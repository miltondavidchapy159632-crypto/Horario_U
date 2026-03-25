const express = require('express');
const { getBlocks, addBlock, updateBlock, deleteBlock } = require('../controllers/blocksController');

const router = express.Router();

router.get('/', getBlocks);
router.post('/', addBlock);
router.put('/:id', updateBlock);
router.delete('/:id', deleteBlock);

module.exports = router;
