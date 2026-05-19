const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Passport Config
require('./config/passport');

const User = require('./models/User');

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
const createRootSuperadmin = async () => {
    const email = process.env.ROOT_SUPERADMIN_EMAIL;
    const password = process.env.ROOT_SUPERADMIN_PASSWORD;
    const name = process.env.ROOT_SUPERADMIN_NAME || 'Root Superadmin';

    if (!email || !password) {
        return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (existing) {
        let updated = false;
        if (existing.role !== 'superadmin') {
            existing.role = 'superadmin';
            updated = true;
            console.log(`⚠️ Promoted existing user ${email} to 'superadmin'.`);
        }
        if (!existing.password) {
            existing.password = await bcrypt.hash(password, 12);
            updated = true;
            console.log(`✅ Set manual password for existing root superadmin ${email}.`);
        }
        if (updated) {
            await existing.save();
        }
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'superadmin',
        isVerified: true
    });
    console.log(`✅ Created root superadmin account for ${email}`);
};

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected Successfully');
        await createRootSuperadmin();
    })
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

// Background Jobs Disabled: Emails only trigger on manual Product/Order updates as requested.
// const startDailyAlertJob = require('./jobs/dailyAlertJob');
// startDailyAlertJob();

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});