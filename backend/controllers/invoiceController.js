const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { createNotificationInternal } = require('./notificationController');
const { logActivity } = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const { generateInvoiceEmailTemplate } = require('../utils/invoiceTemplate');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('❌ GET /api/invoices: User context missing');
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        let query = {};
        if (req.user.role === 'superadmin') {
            query = {};
        } else if (req.user.role === 'admin') {
            // Admins should see their own invoices and invoices created by superadmins
            const User = require('../models/User');
            const superadmins = await User.find({ role: 'superadmin' }, { _id: 1 }).lean();
            const superadminIds = superadmins.map(s => s._id);
            query = { $or: [{ createdBy: req.user._id }, { createdBy: { $in: superadminIds } }] };
        } else {
            query = { createdBy: req.user._id };
        }
        const invoices = await Invoice.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: invoices || []
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
        // Regenerate if: missing, old format, or complex INV- format
        if (!req.body.invoiceId || req.body.invoiceId.length > 8 || req.body.invoiceId.includes('-')) {
            // Find the highest numeric serial across ALL users
            const allInvoices = await Invoice.find({}, { invoiceId: 1 }).lean();
            
            let nextSerial = 1;
            if (allInvoices && allInvoices.length > 0) {
                // Filter for purely numeric IDs and find the max
                const numericIds = allInvoices
                    .map(inv => parseInt(inv.invoiceId))
                    .filter(id => !isNaN(id) && id < 1000000); 
                
                if (numericIds.length > 0) {
                    nextSerial = Math.max(...numericIds) + 1;
                } else {
                    // Fallback if only long IDs exist
                    nextSerial = allInvoices.length + 1;
                }
            }

            req.body.invoiceId = String(nextSerial);
            console.log(`📡 Generated Simple Numeric Invoice ID: ${req.body.invoiceId}`);
        }

        // Validate Stock first (Never allow stock to go negative)
        if (req.body.itemsList && Array.isArray(req.body.itemsList)) {
            for (const item of req.body.itemsList) {
                let productDoc = null;
                if (item.productId) {
                    productDoc = await Product.findById(item.productId);
                } else if (item.product) {
                    productDoc = await Product.findOne({ name: item.product, createdBy: req.user._id });
                }

                if (productDoc) {
                    const requestedQty = Number(item.qty || 0);
                    if (productDoc.stock < requestedQty) {
                        return res.status(400).json({
                            success: false,
                            message: `Insufficient stock for product "${productDoc.name}". Available: ${productDoc.stock}, Requested: ${requestedQty}`
                        });
                    }
                }
            }
            
            // Set itemsCount to total sum of quantities of all products
            req.body.itemsCount = req.body.itemsList.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
        }

        const invoice = await Invoice.create(req.body);

        // If this invoice was created from an order, update the order status
        if (req.body.sourceOrderId) {
            await require('../models/Order').findByIdAndUpdate(req.body.sourceOrderId, {
                status: 'Invoiced'
            });
            console.log(`✅ Order ${req.body.sourceOrderId} marked as Invoiced.`);
        }

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

        // Send Email to Customer if provided (Background process - non-blocking)
        if (invoice.customerEmail) {
            // We don't 'await' this so the response is sent to the user immediately
            const html = generateInvoiceEmailTemplate(invoice);
            sendEmail({
                email: invoice.customerEmail,
                subject: `Invoice from Store - #${invoice.invoiceId}`,
                message: `Thank you for your purchase! Your total is Rs. ${invoice.totalAmount}. Attached is your digital receipt.`,
                html: html
            }).then(() => {
                console.log(`📧 Digital Receipt sent in background to: ${invoice.customerEmail}`);
            }).catch(emailErr => {
                console.error('⚠️ Background email failed:', emailErr.message);
            });
        }

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

// @desc    Get next available invoice ID
// @route   GET /api/invoices/next-id
// @access  Private
const getNextInvoiceId = async (req, res) => {
    try {
        // Find the highest numeric serial across ALL users
        const allInvoices = await Invoice.find({}, { invoiceId: 1 }).lean();
        let nextSerial = 1;
        if (allInvoices && allInvoices.length > 0) {
            const numericIds = allInvoices
                .map(inv => parseInt(inv.invoiceId))
                .filter(id => !isNaN(id) && id < 1000000);
            if (numericIds.length > 0) {
                nextSerial = Math.max(...numericIds) + 1;
            } else {
                nextSerial = allInvoices.length + 1;
            }
        }
        res.status(200).json({ success: true, nextId: String(nextSerial) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete invoices' });
        }
        
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
    deleteInvoice,
    getNextInvoiceId
};
