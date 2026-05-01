const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
    getAllProducts,
    getProduct,
    createProduct,
    createProductsBatch,
    updateProduct,
    deleteProduct,
    getStats
} = require('../controllers/productController');

// All routes protected
router.use(protect);

router.get('/stats', getStats);
router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.post('/batch', createProductsBatch);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;