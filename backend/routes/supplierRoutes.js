const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierProducts,
    getSupplierLots,
    createSupplierLot,
    depleteLotItem,
    deleteSupplierLot
} = require('../controllers/supplierController');

// Protect all routes
router.use(protect);

// Supplier CRUD
router.get('/', getSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

// Supplier -> Products
router.get('/:id/products', getSupplierProducts);

// Supplier -> Lots
router.get('/:id/lots', getSupplierLots);
router.post('/:id/lots', createSupplierLot);

// Lot management
router.put('/lots/:lotId/deplete', depleteLotItem);
router.delete('/lots/:lotId', deleteSupplierLot);

module.exports = router;
