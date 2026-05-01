const mongoose = require('mongoose');

const lotItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    productName: {
        type: String,
        required: true
    },
    quantityReceived: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative']
    },
    quantityDepleted: {
        type: Number,
        default: 0,
        min: [0, 'Depleted cannot be negative']
    },
    purchasePrice: {
        type: Number,
        default: 0,
        min: [0, 'Purchase price cannot be negative']
    }
}, { _id: false });

const supplierLotSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    lotNumber: {
        type: String,
        required: [true, 'Lot number is required'],
        trim: true
    },
    receivedDate: {
        type: Date,
        default: Date.now
    },
    items: [lotItemSchema],
    notes: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Add a virtual for total items received
supplierLotSchema.virtual('totalReceived').get(function () {
    return this.items.reduce((sum, i) => sum + i.quantityReceived, 0);
});

// Add a virtual for total items depleted
supplierLotSchema.virtual('totalDepleted').get(function () {
    return this.items.reduce((sum, i) => sum + i.quantityDepleted, 0);
});

supplierLotSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('SupplierLot', supplierLotSchema);
