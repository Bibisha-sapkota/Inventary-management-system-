const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Dummy data - replace with DB calls later
router.get('/dashboard', auth, isAdmin, (req, res) => {
  res.json({
    message: 'Welcome Admin!',
    stats: {
      products: 120,
      customers: 45,
      orders: 89,
      lowStock: 12
    }
  });
});

module.exports = router;