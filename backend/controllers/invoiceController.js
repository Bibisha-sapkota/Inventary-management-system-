const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { createNotificationInternal } = require('./notificationController');
const { logActivity } = require('../utils/logger');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('❌ GET /api/invoices: User context missing');
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const invoices = await Invoice.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error('❌ GET /api/invoices Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('❌ POST /api/invoices: User context missing');
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        req.body.createdBy = req.user._id;

        // If invoiceId is not provided, looks like it was generated with old logic, or is known to be causing collisions
        // We FORCE backend generation for ANY ID starting with '44600' (old format) or if missing
        if (!req.body.invoiceId || req.body.invoiceId.length < 10 || req.body.invoiceId.startsWith('44600')) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const prefix = `${day}${month}${year}`; // Format: DDMMYYYY

            // Find the highest serial for this prefix across ALL users
            const lastInvoice = await Invoice.findOne({
                invoiceId: new RegExp(`^${prefix}`)
            }).sort({ invoiceId: -1 });

            let nextSerial = 1;
            if (lastInvoice && lastInvoice.invoiceId) {
                const lastSerial = parseInt(lastInvoice.invoiceId.slice(prefix.length)) || 0;
                nextSerial = lastSerial + 1;
            }

            req.body.invoiceId = `${prefix}${String(nextSerial).padStart(3, '0')}`;
            console.log(`📡 Generated System-Wide Invoice ID: ${req.body.invoiceId}`);
        }

        const invoice = await Invoice.create(req.body);

        // Update Stock Levels
        if (req.body.itemsList && Array.isArray(req.body.itemsList)) {
            for (const item of req.body.itemsList) {
                if (item.productId) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -Number(item.qty || 0) }
                    }, { runValidators: true });
                } else if (item.product) {
                    // Fallback: try to find by name if ID is missing (less reliable)
                    await Product.findOneAndUpdate(
                        { name: item.product, createdBy: req.user._id },
                        { $inc: { stock: -Number(item.qty || 0) } },
                        { runValidators: true }
                    );
                }
            }
        }


        // Add internal notification
        await createNotificationInternal(
            req.user._id,
            'New Invoice Generated',
            `Invoice #${invoice.invoiceId} for ${invoice.customer} has been created. Total: Rs. ${invoice.totalAmount}`,
            'success',
            'invoice'
        );

        // Log activity
        await logActivity(
            req.user._id,
            'CREATE',
            'Invoice',
            invoice._id,
            invoice.invoiceId,
            `Created invoice for ${invoice.customer} with ${invoice.itemsCount} items.`,
            { totalAmount: invoice.totalAmount, customer: invoice.customer }
        );

        res.status(201).json({
            success: true,
            message: 'Invoice saved!',
            data: invoice
        });
    } catch (error) {
        console.error('❌ POST /api/invoices Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: `Duplicate Invoice ID: ${req.body.invoiceId}. Please try again.`
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        res.status(200).json({
            success: true,
            message: 'Invoice deleted!'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getInvoices,
    createInvoice,
    deleteInvoice
};
