const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['customer', 'supplier'],
        default: 'customer'
    },
    customerName: {
        type: String,
        required: false
    },
    supplierName: {
        type: String,
        required: false
    },
    returnedProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    newProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    },
    quantity: {
        type: Number,
        default: 1
    },
    reason: {
        type: String,
        required: true
    },
    amountToPay: {
        type: Number,
        default: 0
    },
    amountToRefund: {
        type: Number,
        default: 0
    },
    restocked: {
        type: Boolean,
        default: true
    },
    purchaseDate: {
        type: String,
        required: false
    },
    batchNo: {
        type: String,
        required: false
    },
    billNumber: {
        type: String,
        required: false
    },
    membershipId: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Exchange', exchangeSchema);
