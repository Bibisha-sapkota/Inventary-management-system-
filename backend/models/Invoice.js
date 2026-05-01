const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: String,
        required: true
    },
    membershipId: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        required: true
    },
    itemsCount: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'Cash'
    },
    discountRate: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0
    },
    itemsList: [{
        product: String,
        qty: Number,
        price: Number
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
