const Order = require('../models/Order');

// Get All Orders (User's orders)
const getAllOrders = async (req, res) => {
    try {
        const { status, date, page = 1, limit = 50 } = req.query;

        let query = { user: req.user._id };

        // Admin can see all orders
        if (req.user.role === 'admin') {
            query = {};
        }

        if (status) {
            query.status = status;
        }
        if (date) {
            query.date = date;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Single Order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Order
const createOrder = async (req, res) => {
    try {
        req.body.user = req.user._id;
        const order = await Order.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Order created!',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Order
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order updated!',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Order
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted!'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Order Stats
const getOrderStats = async (req, res) => {
    try {
        let query = { user: req.user._id };
        
        if (req.user.role === 'admin') {
            query = {};
        }

        const total = await Order.countDocuments(query);
        const pending = await Order.countDocuments({ ...query, status: 'Pending' });
        const delivered = await Order.countDocuments({ ...query, status: 'Delivered' });
        const completed = await Order.countDocuments({ ...query, status: 'Completed' });
        const cancelled = await Order.countDocuments({ ...query, status: 'Cancelled' });

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                delivered,
                completed,
                cancelled
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats
};