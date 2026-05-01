const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllRead);
router.put('/:id', markAsRead);

module.exports = router;
