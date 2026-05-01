const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getInvoices,
    createInvoice,
    deleteInvoice
} = require('../controllers/invoiceController');

// All routes protected
router.use(protect);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
