const Exchange = require('../models/Exchange');
const Product = require('../models/Product');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');
const { createNotificationInternal } = require('./notificationController');

// @desc    Get all exchanges
// @route   GET /api/exchanges
// @access  Private
exports.getExchanges = async (req, res) => {
    try {
        let query = { user: req.user._id };

        // If admin, show all exchanges
        if (req.user.role === 'admin') {
            query = {};
        }

        const exchanges = await Exchange.find(query)
            .populate('returnedProduct', 'name productId')
            .populate('newProduct', 'name productId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: exchanges
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new exchange
// @route   POST /api/exchanges
// @access  Private
exports.createExchange = async (req, res) => {
    try {
        const { 
            type,
            customerName, 
            supplierName,
            returnedProductId, 
            newProductId, 
            quantity, 
            reason, 
            restocked, 
            amountToPay, 
            amountToRefund,
            purchaseDate,
            batchNo,
            billNumber,
            membershipId
        } = req.body;

        const isSupplierReturn = type === 'supplier';

        // 1. Check products exist
        const pReturn = await Product.findById(returnedProductId);
        const pNew = newProductId ? await Product.findById(newProductId) : null;

        if (!pReturn) {
            return res.status(404).json({ success: false, message: 'Returned product not found' });
        }

        // 3. Create Exchange record
        const exchange = await Exchange.create({
            user: req.user._id,
            type: type || 'customer',
            customerName: isSupplierReturn ? (supplierName || 'Supplier') : customerName,
            supplierName,
            returnedProduct: returnedProductId,
            newProduct: newProductId || null,
            quantity,
            reason,
            restocked,
            amountToPay,
            amountToRefund,
            purchaseDate,
            batchNo,
            billNumber,
            membershipId
        });

        // 4. Update Stock
        if (isSupplierReturn) {
            // RETURN TO SUPPLIER logic:
            // Decrease stock of what we are returning
            pReturn.stock -= quantity;
            await pReturn.save();

            // Increase stock of what we are receiving (replacement)
            if (pNew) {
                pNew.stock += quantity;
                await pNew.save();
            }
        } else {
            // CUSTOMER EXCHANGE logic:
            // Increment returned product if restocked
            if (restocked) {
                pReturn.stock += quantity;
                await pReturn.save();
            }

            // Decrement new product (what we give to customer)
            if (pNew) {
                pNew.stock -= quantity;
                await pNew.save();
            }
        }

        // 5. Log Activity
        const activityTitle = isSupplierReturn ? 'Supplier Return' : 'Customer Exchange';
        const pNewName = pNew ? pNew.name : 'None';
        await logActivity(
            req.user._id,
            'CREATE',
            'Exchange',
            exchange._id,
            `${activityTitle}: ${pReturn.name} -> ${pNewName}`,
            `${activityTitle} logged: ${quantity}x ${pReturn.name}. Replacement: ${pNewName}. Reason: ${reason}`,
            { customerName, supplierName, type, restocked, reason }
        );

        // 6. Create Notification
        const notifTitle = isSupplierReturn ? 'Supplier Return Logged' : 'New Exchange Logged';
        const targetName = isSupplierReturn ? supplierName : customerName;
        await createNotificationInternal(
            req.user._id,
            notifTitle,
            `${targetName}: ${pReturn.name} ${isSupplierReturn ? 'returned' : 'exchanged'}.`,
            'info',
            'order'
        );

        // If customer initiated, notify admins
        if (req.user.role === 'customer') {
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                await createNotificationInternal(
                    admin._id,
                    `Customer Exchange Request`,
                    `${customerName} requested an exchange for ${pReturn.name}.`,
                    'warning',
                    'order'
                );
            }
        }

        res.status(201).json({
            success: true,
            data: exchange
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete exchange record (doesn't undo stock changes by default)
// @route   DELETE /api/exchanges/:id
// @access  Private
exports.deleteExchange = async (req, res) => {
    try {
        const exchange = await Exchange.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

        res.status(200).json({ success: true, message: 'Exchange record removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
