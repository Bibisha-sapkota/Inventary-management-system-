const Product = require('../models/Product');
const User = require('../models/User');
const { createNotificationInternal } = require('./notificationController');
const checkStockAlerts = require('../utils/checkStockAlerts');
const { logActivity } = require('../utils/logger');

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const { search, category, status, page = 1, limit = 50 } = req.query;

        // Build base visibility filter
        let baseFilter = {};
        if (req.user.role === 'admin') {
            const superAdmins = await User.find({ role: 'superadmin' }).select('_id');
            const superAdminIds = superAdmins.map(admin => admin._id);

            baseFilter.$or = [
                { createdBy: req.user._id },
                { isGlobal: true },
                { createdBy: { $in: superAdminIds } }
            ];
        }

        // Build additional filters
        let extraFilters = {};
        if (search) extraFilters.name = { $regex: search, $options: 'i' };
        if (category) extraFilters.category = category;
        if (status) extraFilters.status = status;

        // Combine using $and if both parts exist
        let query = {};
        const hasBase = Object.keys(baseFilter).length > 0;
        const hasExtra = Object.keys(extraFilters).length > 0;
        if (hasBase && hasExtra) {
            query = { $and: [baseFilter, extraFilters] };
        } else if (hasBase) {
            query = baseFilter;
        } else {
            query = extraFilters;
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
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

// Get Single Product
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Product
const createProduct = async (req, res) => {
    try {
        // Mark as global if created by superadmin
        if (req.user.role === 'superadmin') {
            req.body.isGlobal = true;
        }
        req.body.createdBy = req.user._id;
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created!',
            data: product
        });

        // Trigger notification
        await createNotificationInternal(
            req.user._id, 
            'New Product Added', 
            `${product.name} has been added to your inventory.`,
            'success',
            'stock'
        );

        // Check stock/expiry alerts (conditionally syncs to Gmail and Dashboard)
        await checkStockAlerts(product, req.user);

        // Log activity
        await logActivity(
            req.user._id,
            'CREATE',
            'Product',
            product._id,
            product.name,
            `Added new product: ${product.name} at Rs. ${product.price}.`,
            { stock: product.stock, category: product.category }
        );

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated!',
            data: product
        });

        // Check for low stock notification
        const threshold = 10; // Default threshold
        if (product.stock <= threshold) {
            await createNotificationInternal(
                req.user._id,
                'Low Stock Alert',
                `${product.name} is running low on stock (${product.stock} left).`,
                'warning',
                'stock'
            );
        }

        // Check stock/expiry alerts (conditionally syncs to Gmail and Dashboard)
        await checkStockAlerts(product, req.user);

        // Log activity
        await logActivity(
            req.user._id,
            'UPDATE',
            'Product',
            product._id,
            product.name,
            `Updated product details for: ${product.name}.`,
            { stock: product.stock, price: product.price, status: product.status }
        );

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete products. Only superadmins can delete.'
            });
        }
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted!'
        });

        // Log activity
        await logActivity(
            req.user._id,
            'DELETE',
            'Product',
            product._id,
            product.name,
            `Deleted product: ${product.name} from inventory.`,
            { category: product.category }
        );

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Stats
const getStats = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            const superAdmins = await User.find({ role: 'superadmin' }).select('_id');
            const superAdminIds = superAdmins.map(admin => admin._id);
            
            query.$or = [
                { createdBy: req.user._id },
                { isGlobal: true },
                { createdBy: { $in: superAdminIds } }
            ];
        }
        
        const totalProducts = await Product.countDocuments(query);
        const unactiveProducts = await Product.countDocuments({ ...query, status: 'Unactive' });
        const activeProducts = await Product.countDocuments({ ...query, status: 'Active' });

        const totalValue = await Product.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ['$price', '$stock'] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                activeProducts,
                unactiveProducts,
                totalValue: totalValue[0]?.total || 0
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createProductsBatch = async (req, res) => {
    try {
        const products = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Expected an array of products' });
        }
        
        const isGlobal = req.user.role === 'superadmin';
        const productsWithUser = products.map(p => ({ ...p, createdBy: req.user._id, isGlobal }));
        const createdProducts = await Product.insertMany(productsWithUser);

        res.status(201).json({
            success: true,
            message: `${createdProducts.length} products imported!`,
            data: createdProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProduct,
    createProduct,
    createProductsBatch,
    updateProduct,
    deleteProduct,
    getStats
};