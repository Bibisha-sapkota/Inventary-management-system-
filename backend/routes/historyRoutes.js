const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getHistory } = require('../controllers/historyController');

router.use(protect);
router.get('/', getHistory);

module.exports = router;
