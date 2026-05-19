const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true
    },
    contactPerson: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Supplier email is required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Supplier phone is required']
    },
    address: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'Regular'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
