const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
    getAllOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats
} = require('../controllers/orderController');

// All routes protected
router.use(protect);

router.get('/stats', getOrderStats);
router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;