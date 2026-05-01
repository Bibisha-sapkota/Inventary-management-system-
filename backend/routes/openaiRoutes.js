const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../controllers/openaiController');

// For now, no auth middleware to test easily, but ideally should be protected
router.post('/', getChatResponse);

module.exports = router;
