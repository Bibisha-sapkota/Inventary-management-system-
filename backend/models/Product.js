const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Selling Price (MRP) is required'],
        min: [0, 'Price cannot be negative']
    },
    buyingPrice: {
        type: Number,
        default: 0,
        min: [0, 'Buying price cannot be negative']
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'General'
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'in-stock'
    },
    expiryDate: {
        type: Date,
        default: null
    },
    maxStock: {
        type: Number,
        default: 100
    },
    reorderLevel: {
        type: Number,
        default: 10
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        default: null
    },
    supplierName: {
        type: String,
        default: ''
    },
    productId: {
        type: String,
        default: ''
    },
    batchNo: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Auto update status
productSchema.pre('save', function (next) {
    if (this.stock <= 0) {
        this.status = 'out-of-stock';
    } else if (this.stock <= this.reorderLevel) {
        this.status = 'low-stock';
    } else {
        this.status = 'in-stock';
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);