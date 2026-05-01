const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Import Passport Config
require('./config/passport');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const historyRoutes = require('./routes/historyRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// ========================
// MIDDLEWARE
// ========================
app.use(cors({
    origin: true, // Dynamically allow the origin that is making the request
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// ========================
// DATABASE CONNECTION
// ========================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// ========================
// ROUTES
// ========================
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/chat', openaiRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/settings', settingsRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 Grocery Inventory API Running!',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders'
        }
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Background Jobs Disabled: Emails now only trigger on manual Product/Order updates as requested.
// const startDailyAlertJob = require('./jobs/dailyAlertJob');
// startDailyAlertJob();

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});