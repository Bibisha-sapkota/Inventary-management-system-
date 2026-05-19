const User = require('../models/User');
const Order = require('../models/Order'); // 🛠️ Fix: Added missing import
const { createNotificationInternal, notifySuperadmins } = require('./notificationController');
const { logActivity } = require('../utils/logger');

// @desc    Get all customers created by the admin
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
    try {
        let query = { role: 'customer' };
        
        if (req.user.role !== 'superadmin') {
            // Find all orders where this admin is the owner/seller
            const orders = await Order.find({ user: req.user._id }).distinct('customerId');
            query = {
                role: 'customer',
                $or: [
                    { createdBy: req.user._id },
                    { _id: { $in: orders } }
                ]
            };
        }
        
        const customers = await User.find(query).select('-password');
        
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
    try {
        const { name, email, phone, status, sno } = req.body;

        // Check if user already exists (regardless of role)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.role === 'admin' 
                    ? `Email already exists as an Admin/Staff account. Customers must use a unique email.` 
                    : `Customer with this email already exists.`
            });
        }

        const customer = await User.create({
            name,
            email,
            phone,
            sno,
            status, // Note: status isn't in User model yet, but allowed by mongoose if strict is off or added
            role: 'customer',
            createdBy: req.user._id
        });

        // Add internal notification (to admin)
        if (req.user.role !== 'superadmin') {
            await createNotificationInternal(
                req.user._id,
                'New Customer Added',
                `Customer ${name} (${email}) has been added to your system.`,
                'info',
                'customer'
            );
        }

        // Notify Superadmins
        await notifySuperadmins(
            'Global Customer Created',
            `A new customer ${name} was added to the system by admin ${req.user.name}.`,
            'info',
            'customer'
        );

        // Log activity
        await logActivity(
            req.user._id,
            'CREATE',
            'Customer',
            customer._id,
            customer.name,
            `Registered new customer: ${customer.name}.`,
            { email: customer.email, phone: customer.phone }
        );

        res.status(201).json({
            success: true,
            data: customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
    try {
        const { name, email, phone, status, sno } = req.body;
        
        // Find user by ID and ensure they are a customer
        let customer = await User.findById(req.params.id);
        
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Check if email changed and if new email is already taken
        if (email && email !== customer.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        customer = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, status, sno },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: customer
        });

        // Log activity
        await logActivity(
            req.user._id,
            'UPDATE',
            'Customer',
            customer._id,
            customer.name,
            `Updated customer profile for: ${customer.name}.`,
            { status: customer.status, email: customer.email }
        );
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id);

        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Customer deleted'
        });

        // Log activity
        await logActivity(
            req.user._id,
            'DELETE',
            'Customer',
            customer._id,
            customer.name,
            `Deleted customer account: ${customer.name} (${customer.email}).`,
            { email: customer.email }
        );
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
