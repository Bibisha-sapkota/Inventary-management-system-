const Supplier = require('../models/Supplier');
const SupplierLot = require('../models/SupplierLot');
const Product = require('../models/Product');
const { logActivity } = require('../utils/logger');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User context missing' });
        }

        // Superadmins see all suppliers, others only see their own
        const query = req.user.role === 'superadmin' ? {} : { createdBy: req.user._id };
        const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: suppliers || []
        });
    } catch (error) {
        console.error('❌ GetSuppliers Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = async (req, res) => {
    try {
        req.body.createdBy = req.user._id;
        const supplier = await Supplier.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Supplier added!',
            data: supplier
        });

        // Log activity
        await logActivity(
            req.user._id,
            'CREATE',
            'Supplier',
            supplier._id,
            supplier.name,
            `Added new supplier: ${supplier.name}.`,
            { category: supplier.category, phone: supplier.phone }
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
        res.status(200).json({
            success: true,
            message: 'Supplier updated!',
            data: supplier
        });

        // Log activity
        await logActivity(
            req.user._id,
            'UPDATE',
            'Supplier',
            supplier._id,
            supplier.name,
            `Updated supplier details for: ${supplier.name}.`,
            { category: supplier.category, phone: supplier.phone }
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
        res.status(200).json({
            success: true,
            message: 'Supplier deleted!'
        });

        // Log activity
        await logActivity(
            req.user._id,
            'DELETE',
            'Supplier',
            supplier._id,
            supplier.name,
            `Deleted supplier: ${supplier.name}.`,
            { category: supplier.category }
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get products linked to a supplier
// @route   GET /api/suppliers/:id/products
// @access  Private
const getSupplierProducts = async (req, res) => {
    try {
        const products = await Product.find({
            supplier: req.params.id,
            createdBy: req.user._id
        }).select('name price stock category status supplierName');

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all lots for a supplier
// @route   GET /api/suppliers/:id/lots
// @access  Private
const getSupplierLots = async (req, res) => {
    try {
        const lots = await SupplierLot.find({
            supplier: req.params.id,
            createdBy: req.user._id
        }).sort({ receivedDate: -1 });

        res.status(200).json({
            success: true,
            data: lots
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a lot for a supplier
// @route   POST /api/suppliers/:id/lots
// @access  Private
const createSupplierLot = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

        const { lotNumber, receivedDate, items, notes } = req.body;

        const lot = await SupplierLot.create({
            supplier: req.params.id,
            lotNumber,
            receivedDate: receivedDate || Date.now(),
            items: items || [],
            notes: notes || '',
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: `Lot ${lotNumber} created for ${supplier.name}!`,
            data: lot
        });

        // Log activity
        await logActivity(
            req.user._id,
            'CREATE',
            'Lot',
            lot._id,
            `Lot: ${lotNumber}`,
            `Received new stock lot from ${supplier.name}. Lot Number: ${lotNumber}.`,
            { supplier: supplier.name, itemsCount: items?.length }
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update depleted quantity in a lot item
// @route   PUT /api/suppliers/lots/:lotId/deplete
// @access  Private
const depleteLotItem = async (req, res) => {
    try {
        const { productName, quantityDepleted } = req.body;
        const lot = await SupplierLot.findById(req.params.lotId);
        if (!lot) return res.status(404).json({ success: false, message: 'Lot not found' });

        const item = lot.items.find(i => i.productName === productName);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found in lot' });

        item.quantityDepleted = Math.min(item.quantityReceived, quantityDepleted);
        await lot.save();

        res.status(200).json({
            success: true,
            message: 'Lot updated!',
            data: lot
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a lot
// @route   DELETE /api/suppliers/lots/:lotId
// @access  Private
const deleteSupplierLot = async (req, res) => {
    try {
        const lot = await SupplierLot.findByIdAndDelete(req.params.lotId);
        if (!lot) return res.status(404).json({ success: false, message: 'Lot not found' });
        res.status(200).json({ success: true, message: 'Lot deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierProducts,
    getSupplierLots,
    createSupplierLot,
    depleteLotItem,
    deleteSupplierLot
};
