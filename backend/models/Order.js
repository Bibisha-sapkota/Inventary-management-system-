const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: {
        type: String,
        required: [true, 'Product name is required']
    },
    invoiceNumber: {
        type: String,
        sparse: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    status: {
        type: String,
        enum: ['Pending', 'Delivered', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    date: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        default: 'Guest'
    },
    customerEmail: {
        type: String,
        default: ''
    },
    customerPhone: {
        type: String,
        default: ''
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);