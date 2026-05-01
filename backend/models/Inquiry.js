const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        enum: ['Sales', 'Support', 'Demo', 'Partnership', 'Other'],
        default: 'Sales'
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved'],
        default: 'New'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);
