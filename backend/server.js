require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors({
  origin: "http://localhost:3000", // Your frontend
  credentials: true
}));

app.use(express.json()); // IMPORTANT

// ----------------------
// DATABASE CONNECTION
// ----------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

// ----------------------
// ROUTES
// ----------------------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ----------------------
// SERVER START
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
