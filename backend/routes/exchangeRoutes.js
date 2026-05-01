const express = require('express');
const router = express.Router();
const { getExchanges, createExchange, deleteExchange } = require('../controllers/exchangeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getExchanges);
router.post('/', createExchange);
router.delete('/:id', deleteExchange);

module.exports = router;
